import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto, { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { read, write, reset } from './store.js';
import { ALL_PERMISSIONS } from './seedData.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'samagra-dev-secret-change-me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const MIN_ORDER = 1000;
const ORDER_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

if (process.env.NODE_ENV === 'production') {
  if (JWT_SECRET === 'samagra-dev-secret-change-me') console.warn('⚠️  Set JWT_SECRET in .env');
  if (ADMIN_PASS === 'admin123') console.warn('⚠️  Set ADMIN_PASS in .env');
}

// ---------- password helpers (Node built-in crypto, no extra deps) ----------
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  try {
    const derived = scryptSync(password, salt, 64);
    return timingSafeEqual(Buffer.from(hash, 'hex'), derived);
  } catch {
    return false;
  }
}

// ---------- bootstrap default super-admin from env vars ----------
function ensureDefaultAdmin() {
  const db = read();
  if (db.users.find((u) => u.username === ADMIN_USER && u.roleId === 'super-admin')) return;
  db.users.push({
    id: crypto.randomUUID(),
    name: 'Super Admin',
    username: ADMIN_USER,
    email: '',
    phone: '',
    passwordHash: hashPassword(ADMIN_PASS),
    roleId: 'super-admin',
    active: true,
    createdAt: new Date().toISOString(),
  });
  write(db);
  console.log(`✅ Default admin user "${ADMIN_USER}" created.`);
}
ensureDefaultAdmin();

// ---------- security middleware ----------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : true;

app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(compression());
app.use(express.json({ limit: '100kb' }));

const limiter      = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const writeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20,  standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Try again later.' } });
const reviewLimiter= rateLimit({ windowMs: 60 * 60 * 1000, max: 5,   standardHeaders: true, legacyHeaders: false, message: { error: 'Too many reviews. Try again later.' } });
app.use(limiter);

// ---------- auth + RBAC middleware ----------
const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth: attaches user if token present, doesn't fail if absent
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch { /* ignore */ } }
  next();
};

// Middleware factory: require a specific permission
const can = (permission) => [
  auth,
  (req, res, next) => {
    if (!(req.user?.permissions || []).includes(permission))
      return res.status(403).json({ error: `Permission required: ${permission}` });
    next();
  },
];

// ---------- helpers ----------
function paginate(items, page, limit, fallbackLimit = 12) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit, 10) || fallbackLimit));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, pages, limit };
}

const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const sanitize = (v, max = 500) => String(v ?? '').trim().slice(0, max);

// ---------- public ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/categories', (_req, res) => {
  const db = read();
  const counts = db.products.reduce((m, p) => ((m[p.category] = (m[p.category] || 0) + 1), m), {});
  res.json(db.categories.map((c) => ({ ...c, count: counts[c.id] || 0 })));
});

app.get('/api/content', (_req, res) => res.json(read().content));

app.get('/api/products', (req, res) => {
  const { category, search, badge, sort, minRating, inStock, page, limit } = req.query;
  let items = read().products;

  if (category && category !== 'all') items = items.filter((p) => p.category === category);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q) || (p.keyword || '').includes(q));
  }

  const prices = items.map((p) => p.price);
  const facets = { minPrice: prices.length ? Math.min(...prices) : 0, maxPrice: prices.length ? Math.max(...prices) : 0 };

  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if (!Number.isNaN(minPrice) && minPrice > 0) items = items.filter((p) => p.price >= minPrice);
  if (!Number.isNaN(maxPrice) && maxPrice > 0) items = items.filter((p) => p.price <= maxPrice);
  if (minRating) items = items.filter((p) => p.rating >= Number(minRating));
  if (inStock === 'true') items = items.filter((p) => p.inStock);
  if (badge === 'true') items = items.filter((p) => p.badge);

  if (sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
  else if (sort === 'name-asc') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'discount') items = [...items].sort((a, b) => (b.mrp - b.price) / (b.mrp || 1) - (a.mrp - a.price) / (a.mrp || 1));

  const result = paginate(items, page, limit);
  result.items = result.items.map(({ reviewsList: _r, ...rest }) => rest);
  res.json({ ...result, facets });
});

app.get('/api/products/:id', (req, res) => {
  const db = read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const related = db.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6)
    .map(({ reviewsList: _r, ...rest }) => rest);
  const { reviewsList: _r, ...productData } = product;
  res.json({ ...productData, related });
});

// ---------- reviews ----------
app.get('/api/products/:id/reviews', (req, res) => {
  const product = read().products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const reviews = (product.reviewsList || []).filter((r) => r.status === 'approved');
  res.json(paginate(reviews, req.query.page, req.query.limit, 10));
});

app.post('/api/products/:id/reviews', reviewLimiter, (req, res) => {
  const db = read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  const name   = sanitize(req.body?.name, 80);
  const text   = sanitize(req.body?.text, 1000);
  const rating = Math.min(5, Math.max(1, Number(req.body?.rating) || 0));

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (text.length < 10) return res.status(400).json({ error: 'Review must be at least 10 characters' });
  if (!rating) return res.status(400).json({ error: 'Rating (1-5) is required' });

  const review = { id: crypto.randomUUID(), productId: product.id, productName: product.name, name, text, rating, status: 'pending', createdAt: new Date().toISOString() };
  product.reviewsList = [review, ...(product.reviewsList || [])];
  write(db);
  res.status(201).json({ ok: true, message: 'Your review has been submitted and will appear after approval.' });
});

// ---------- leads ----------
app.post('/api/leads', writeLimiter, (req, res) => {
  const name     = sanitize(req.body?.name, 100);
  const phone    = sanitize(req.body?.phone, 20);
  const business = sanitize(req.body?.business, 150);
  const type     = sanitize(req.body?.type, 30);
  const message  = sanitize(req.body?.message, 500);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!/^[\d\s+\-()]{7,15}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number' });
  const db = read();
  db.leads.unshift({ id: crypto.randomUUID(), name, phone, business, type: type || 'callback', message, status: 'new', createdAt: new Date().toISOString() });
  write(db);
  res.status(201).json({ ok: true });
});

// ---------- orders ----------
app.post('/api/orders', writeLimiter, optionalAuth, (req, res) => {
  const { customer, items, notes } = req.body || {};
  const name  = sanitize(customer?.name, 100);
  const phone = sanitize(customer?.phone, 20);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!/^[\d\s+\-()]{7,15}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Your cart is empty' });
  if (items.length > 200) return res.status(400).json({ error: 'Too many items in cart' });

  const db = read();
  const lineItems = items.map((i) => {
    const p = db.products.find((x) => x.id === i.id);
    const price = p ? p.price : 0;
    const qty = Math.min(9999, Math.max(1, Number(i.qty) || 1));
    return p ? { id: i.id, name: p.name, unit: p.unit, image: p.image, price, qty, lineTotal: price * qty } : null;
  }).filter(Boolean);

  if (lineItems.length === 0) return res.status(400).json({ error: 'No valid products in cart' });
  const total = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  if (total < MIN_ORDER) return res.status(400).json({ error: `Minimum order value is ₹${MIN_ORDER}.` });

  const order = {
    id: 'SM' + Date.now().toString(36).toUpperCase(),
    status: 'placed',
    customer: { name, phone, business: sanitize(customer.business, 150), address: sanitize(customer.address, 300), city: sanitize(customer.city, 100), pincode: sanitize(customer.pincode, 10) },
    items: lineItems,
    itemCount: lineItems.reduce((s, i) => s + i.qty, 0),
    total,
    notes: sanitize(notes, 500),
    userId: req.user?.userId || null,
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(order);
  write(db);
  res.status(201).json(order);
});

app.get('/api/orders/:id', (req, res) => {
  const order = read().orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders/track', limiter, (req, res) => {
  const id    = sanitize(req.body?.id, 30);
  const phone = sanitize(req.body?.phone, 20);
  if (!id && !phone) return res.status(400).json({ error: 'Provide an order ID or phone number' });
  let orders = read().orders;
  if (id) orders = orders.filter((o) => o.id.toLowerCase() === id.toLowerCase());
  if (phone) orders = orders.filter((o) => o.customer.phone === phone);
  res.json(orders.slice(0, 20).map((o) => ({ id: o.id, status: o.status, createdAt: o.createdAt, total: o.total, itemCount: o.itemCount, customer: { name: o.customer.name, phone: o.customer.phone } })));
});

// ============================================================
// PUBLIC SETTINGS
// ============================================================
app.get('/api/settings', (_req, res) => res.json(read().settings));

// ============================================================
// UNIFIED AUTH  (register / login / me)
// ============================================================
app.post('/api/auth/register', authLimiter, (req, res) => {
  const name     = sanitize(req.body?.name, 100);
  const email    = sanitize(req.body?.email, 200).toLowerCase();
  const password = String(req.body?.password ?? '');
  const phone    = sanitize(req.body?.phone, 20);

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Valid email is required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const db = read();
  if (db.users.find((u) => u.email?.toLowerCase() === email || u.username?.toLowerCase() === email))
    return res.status(409).json({ error: 'An account with this email already exists' });

  const user = {
    id: crypto.randomUUID(),
    name, username: email, email, phone,
    passwordHash: hashPassword(password),
    roleId: 'customer',
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  write(db);

  const role = db.roles.find((r) => r.id === 'customer');
  const permissions = role?.permissions || [];
  const token = jwt.sign(
    { userId: user.id, username: user.username, name: user.name, email: user.email, roleId: 'customer', roleName: 'Customer', permissions },
    JWT_SECRET, { expiresIn: '30d' },
  );
  const { passwordHash: _h, ...safe } = user;
  res.status(201).json({ token, user: { ...safe, roleName: 'Customer', permissions } });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const identifier = sanitize(req.body?.identifier || req.body?.username || req.body?.email || '', 200).toLowerCase();
  const password   = String(req.body?.password ?? '');
  if (!identifier || !password) return res.status(400).json({ error: 'Email/username and password are required' });

  const db = read();
  const user = db.users.find(
    (u) => u.active !== false &&
           (u.email?.toLowerCase() === identifier || u.username?.toLowerCase() === identifier),
  );
  if (!user || !verifyPassword(password, user.passwordHash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const role = db.roles.find((r) => r.id === user.roleId);
  const permissions = role?.permissions || [];
  const expiresIn = user.roleId === 'customer' ? '30d' : '24h';
  const token = jwt.sign(
    { userId: user.id, username: user.username, name: user.name, email: user.email, roleId: user.roleId, roleName: role?.name || '', permissions },
    JWT_SECRET, { expiresIn },
  );
  const { passwordHash: _h, ...safe } = user;
  res.json({ token, user: { ...safe, roleName: role?.name || '', permissions } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const db = read();
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const role = db.roles.find((r) => r.id === user.roleId);
  const { passwordHash: _h, ...safe } = user;
  res.json({ ...safe, roleName: role?.name || '', permissions: role?.permissions || [] });
});

// ============================================================
// ADMIN AUTH
// ============================================================
app.post('/api/admin/login', authLimiter, (req, res) => {
  const username = sanitize(req.body?.username, 80);
  const password = String(req.body?.password ?? '');
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  const db = read();
  const user = db.users.find((u) => u.username === username && u.active !== false);
  if (!user || !verifyPassword(password, user.passwordHash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const role = db.roles.find((r) => r.id === user.roleId);
  const permissions = role?.permissions || [];

  const token = jwt.sign(
    { userId: user.id, username: user.username, roleId: user.roleId, roleName: role?.name || '', permissions },
    JWT_SECRET,
    { expiresIn: '12h' },
  );
  res.json({ token, user: { id: user.id, username: user.username, roleId: user.roleId, roleName: role?.name || '', permissions } });
});

app.get('/api/admin/me', auth, (req, res) => {
  const db = read();
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const role = db.roles.find((r) => r.id === user.roleId);
  res.json({ id: user.id, username: user.username, roleId: user.roleId, roleName: role?.name || '', permissions: role?.permissions || [], active: user.active, createdAt: user.createdAt });
});

// ============================================================
// ROLES CRUD
// ============================================================
app.get('/api/admin/roles', ...can('roles:read'), (_req, res) => {
  const db = read();
  // Attach user count per role
  const counts = db.users.reduce((m, u) => ((m[u.roleId] = (m[u.roleId] || 0) + 1), m), {});
  res.json(db.roles.map((r) => ({ ...r, userCount: counts[r.id] || 0 })));
});

app.post('/api/admin/roles', ...can('roles:write'), (req, res) => {
  const name        = sanitize(req.body?.name, 80);
  const description = sanitize(req.body?.description, 300);
  const permissions = (req.body?.permissions || []).filter((p) => ALL_PERMISSIONS.includes(p));
  if (!name) return res.status(400).json({ error: 'Role name is required' });

  const db = read();
  const id = slugify(name) + '-' + crypto.randomUUID().slice(0, 4);
  if (db.roles.find((r) => r.name.toLowerCase() === name.toLowerCase()))
    return res.status(409).json({ error: 'A role with that name already exists' });

  const role = { id, name, description, permissions, isSystem: false, createdAt: new Date().toISOString() };
  db.roles.push(role);
  write(db);
  res.status(201).json(role);
});

app.put('/api/admin/roles/:id', ...can('roles:write'), (req, res) => {
  const db = read();
  const role = db.roles.find((r) => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found' });

  if (req.body.name !== undefined) role.name = sanitize(req.body.name, 80);
  if (req.body.description !== undefined) role.description = sanitize(req.body.description, 300);
  if (req.body.permissions !== undefined && !role.isSystem)
    role.permissions = (req.body.permissions || []).filter((p) => ALL_PERMISSIONS.includes(p));

  write(db);
  res.json(role);
});

app.delete('/api/admin/roles/:id', ...can('roles:delete'), (req, res) => {
  const db = read();
  const role = db.roles.find((r) => r.id === req.params.id);
  if (!role) return res.status(404).json({ error: 'Role not found' });
  if (role.isSystem) return res.status(403).json({ error: 'System roles cannot be deleted' });
  if (db.users.some((u) => u.roleId === req.params.id))
    return res.status(409).json({ error: 'Reassign all users before deleting this role' });
  db.roles = db.roles.filter((r) => r.id !== req.params.id);
  write(db);
  res.json({ ok: true });
});

// ============================================================
// USERS CRUD
// ============================================================
app.get('/api/admin/users', ...can('users:read'), (req, res) => {
  const { search, page, limit } = req.query;
  const db = read();
  let users = db.users.map(({ passwordHash: _h, ...u }) => {
    const role = db.roles.find((r) => r.id === u.roleId);
    return { ...u, roleName: role?.name || u.roleId };
  });
  if (search) {
    const q = sanitize(search, 80).toLowerCase();
    users = users.filter((u) => u.username.toLowerCase().includes(q) || (u.roleName || '').toLowerCase().includes(q));
  }
  res.json(paginate(users, page, limit, 20));
});

app.post('/api/admin/users', ...can('users:write'), (req, res) => {
  const username = sanitize(req.body?.username, 80);
  const password = String(req.body?.password ?? '');
  const roleId   = sanitize(req.body?.roleId, 80);

  if (!username) return res.status(400).json({ error: 'Username is required' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!roleId) return res.status(400).json({ error: 'Role is required' });

  const db = read();
  if (!db.roles.find((r) => r.id === roleId)) return res.status(400).json({ error: 'Invalid role' });
  if (db.users.find((u) => u.username.toLowerCase() === username.toLowerCase()))
    return res.status(409).json({ error: 'Username already taken' });

  const user = { id: crypto.randomUUID(), username, passwordHash: hashPassword(password), roleId, active: true, createdAt: new Date().toISOString() };
  db.users.push(user);
  write(db);
  const { passwordHash: _h, ...safe } = user;
  res.status(201).json(safe);
});

app.put('/api/admin/users/:id', ...can('users:write'), (req, res) => {
  const db = read();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Prevent removing the last super-admin
  if (req.body.roleId && req.body.roleId !== 'super-admin' && user.roleId === 'super-admin') {
    const otherAdmins = db.users.filter((u) => u.id !== user.id && u.roleId === 'super-admin' && u.active !== false);
    if (otherAdmins.length === 0) return res.status(409).json({ error: 'Cannot demote the last Super Admin' });
  }
  if (req.body.active === false && user.roleId === 'super-admin') {
    const otherAdmins = db.users.filter((u) => u.id !== user.id && u.roleId === 'super-admin' && u.active !== false);
    if (otherAdmins.length === 0) return res.status(409).json({ error: 'Cannot deactivate the last Super Admin' });
  }

  if (req.body.username !== undefined) {
    const newName = sanitize(req.body.username, 80);
    if (db.users.find((u) => u.id !== user.id && u.username.toLowerCase() === newName.toLowerCase()))
      return res.status(409).json({ error: 'Username already taken' });
    user.username = newName;
  }
  if (req.body.roleId !== undefined) {
    if (!db.roles.find((r) => r.id === req.body.roleId)) return res.status(400).json({ error: 'Invalid role' });
    user.roleId = req.body.roleId;
  }
  if (req.body.active !== undefined) user.active = Boolean(req.body.active);

  write(db);
  const { passwordHash: _h, ...safe } = user;
  res.json(safe);
});

app.put('/api/admin/users/:id/password', ...can('users:write'), (req, res) => {
  const password = String(req.body?.password ?? '');
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const db = read();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.passwordHash = hashPassword(password);
  write(db);
  res.json({ ok: true });
});

app.delete('/api/admin/users/:id', ...can('users:delete'), (req, res) => {
  if (req.user.userId === req.params.id) return res.status(409).json({ error: "You can't delete your own account" });
  const db = read();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.roleId === 'super-admin') {
    const others = db.users.filter((u) => u.id !== user.id && u.roleId === 'super-admin' && u.active !== false);
    if (others.length === 0) return res.status(409).json({ error: 'Cannot delete the last Super Admin' });
  }
  db.users = db.users.filter((u) => u.id !== req.params.id);
  write(db);
  res.json({ ok: true });
});

// ============================================================
// ADMIN: PRODUCTS
// ============================================================
app.post('/api/products', ...can('products:write'), (req, res) => {
  const b = req.body || {};
  const name = sanitize(b.name, 150);
  if (!name || !b.category) return res.status(400).json({ error: 'name and category required' });
  const db = read();
  const slug = slugify(name);
  const product = {
    id: slug + '-' + crypto.randomUUID().slice(0, 6),
    name, slug,
    category: sanitize(b.category, 50),
    unit: sanitize(b.unit, 50) || '1 unit',
    price: Number(b.price) || 0,
    mrp: Number(b.mrp) || Number(b.price) || 0,
    rating: Number(b.rating) || 4.5,
    reviews: Number(b.reviews) || 0,
    badge: sanitize(b.badge, 30),
    inStock: b.inStock !== false,
    image: sanitize(b.image, 500) || `https://loremflickr.com/600/600/${encodeURIComponent(b.keyword || 'food')}`,
    keyword: sanitize(b.keyword, 100) || 'food',
    description: sanitize(b.description, 1000) || `Premium quality ${name}.`,
    reviewsList: [],
  };
  db.products.unshift(product);
  write(db);
  res.status(201).json(product);
});

app.put('/api/products/:id', ...can('products:write'), (req, res) => {
  const db = read();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const cur = db.products[idx];
  db.products[idx] = {
    ...cur,
    name:        b.name        !== undefined ? sanitize(b.name, 150)        : cur.name,
    category:    b.category    !== undefined ? sanitize(b.category, 50)     : cur.category,
    unit:        b.unit        !== undefined ? sanitize(b.unit, 50)         : cur.unit,
    description: b.description !== undefined ? sanitize(b.description, 1000): cur.description,
    badge:       b.badge       !== undefined ? sanitize(b.badge, 30)        : cur.badge,
    image:       b.image       !== undefined ? sanitize(b.image, 500)       : cur.image,
    keyword:     b.keyword     !== undefined ? sanitize(b.keyword, 100)     : cur.keyword,
    price:       b.price       !== undefined ? Number(b.price)              : cur.price,
    mrp:         b.mrp         !== undefined ? Number(b.mrp)                : cur.mrp,
    rating:      b.rating      !== undefined ? Number(b.rating)             : cur.rating,
    reviews:     b.reviews     !== undefined ? Number(b.reviews)            : cur.reviews,
    inStock:     b.inStock     !== undefined ? Boolean(b.inStock)           : cur.inStock,
    id: cur.id,
    reviewsList: cur.reviewsList || [],
  };
  write(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', ...can('products:delete'), (req, res) => {
  const db = read();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: 'Not found' });
  write(db);
  res.json({ ok: true });
});

// ============================================================
// ADMIN: CATEGORIES
// ============================================================
app.post('/api/categories', ...can('categories:write'), (req, res) => {
  const b = req.body || {};
  const name = sanitize(b.name, 100);
  if (!name) return res.status(400).json({ error: 'name required' });
  const db = read();
  const id = b.id ? sanitize(b.id, 50) : slugify(name);
  if (db.categories.some((c) => c.id === id)) return res.status(409).json({ error: 'Category exists' });
  const category = { id, name, tagline: sanitize(b.tagline, 200), image: sanitize(b.image, 500) || `https://loremflickr.com/600/600/${encodeURIComponent(b.keyword || 'food')}` };
  db.categories.push(category);
  write(db);
  res.status(201).json(category);
});

app.put('/api/categories/:id', ...can('categories:write'), (req, res) => {
  const db = read();
  const cat = db.categories.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  if (req.body.name     !== undefined) cat.name     = sanitize(req.body.name, 100);
  if (req.body.tagline  !== undefined) cat.tagline  = sanitize(req.body.tagline, 200);
  if (req.body.image    !== undefined) cat.image    = sanitize(req.body.image, 500);
  write(db);
  res.json(cat);
});

app.delete('/api/categories/:id', ...can('categories:delete'), (req, res) => {
  const db = read();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  write(db);
  res.json({ ok: true });
});

// ============================================================
// ADMIN: REVIEWS
// ============================================================
app.get('/api/admin/reviews', ...can('reviews:read'), (req, res) => {
  const { status, search, page, limit } = req.query;
  const db = read();
  let reviews = db.products.flatMap((p) => (p.reviewsList || []).map((r) => ({ ...r, productId: p.id, productName: p.name })));
  if (status && status !== 'all') reviews = reviews.filter((r) => r.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    reviews = reviews.filter((r) => r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q));
  }
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(paginate(reviews, page, limit, 15));
});

app.put('/api/admin/reviews/:productId/:reviewId', ...can('reviews:write'), (req, res) => {
  const { productId, reviewId } = req.params;
  const db = read();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const review = (product.reviewsList || []).find((r) => r.id === reviewId);
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (!['approved', 'rejected', 'pending'].includes(req.body?.status))
    return res.status(400).json({ error: 'status must be approved, rejected, or pending' });
  review.status = req.body.status;
  const approved = (product.reviewsList || []).filter((r) => r.status === 'approved');
  if (approved.length > 0) {
    product.rating = Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10;
    product.reviews = approved.length;
  }
  write(db);
  res.json(review);
});

app.delete('/api/admin/reviews/:productId/:reviewId', ...can('reviews:delete'), (req, res) => {
  const { productId, reviewId } = req.params;
  const db = read();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const before = (product.reviewsList || []).length;
  product.reviewsList = (product.reviewsList || []).filter((r) => r.id !== reviewId);
  if (product.reviewsList.length === before) return res.status(404).json({ error: 'Review not found' });
  write(db);
  res.json({ ok: true });
});

// ============================================================
// ADMIN: LEADS
// ============================================================
app.get('/api/admin/leads', ...can('leads:read'), (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().leads;
  if (status && status !== 'all') items = items.filter((l) => l.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    items = items.filter((l) => `${l.name} ${l.phone} ${l.business}`.toLowerCase().includes(q));
  }
  res.json(paginate(items, page, limit, 10));
});

app.put('/api/admin/leads/:id', ...can('leads:write'), (req, res) => {
  const db = read();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Not found' });
  if (req.body.status) lead.status = sanitize(req.body.status, 20);
  write(db);
  res.json(lead);
});

// ============================================================
// ADMIN: ORDERS
// ============================================================
app.get('/api/admin/orders', ...can('orders:read'), (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().orders;
  if (status && status !== 'all') items = items.filter((o) => o.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    items = items.filter((o) => `${o.id} ${o.customer.name} ${o.customer.phone} ${o.customer.business}`.toLowerCase().includes(q));
  }
  res.json(paginate(items, page, limit, 10));
});

app.put('/api/admin/orders/:id', ...can('orders:write'), (req, res) => {
  const db = read();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (req.body.status && ORDER_STATUSES.includes(req.body.status)) order.status = req.body.status;
  write(db);
  res.json(order);
});

// ============================================================
// ADMIN: CONTENT + OVERVIEW + RESET
// ============================================================
app.get('/api/admin/overview', ...can('dashboard:view'), (_req, res) => {
  const db = read();
  const active = db.orders.filter((o) => o.status !== 'cancelled');
  const allReviews = db.products.flatMap((p) => p.reviewsList || []);
  res.json({
    products: db.products.length,
    categories: db.categories.length,
    leads: db.leads.length,
    newLeads: db.leads.filter((l) => l.status === 'new').length,
    orders: db.orders.length,
    pendingOrders: db.orders.filter((o) => ['placed', 'confirmed', 'packed', 'shipped'].includes(o.status)).length,
    revenue: active.reduce((s, o) => s + o.total, 0),
    inStock: db.products.filter((p) => p.inStock).length,
    pendingReviews: allReviews.filter((r) => r.status === 'pending').length,
    users: db.users.length,
  });
});

const CONTENT_KEYS = ['hero', 'marquee', 'features', 'steps', 'comparison', 'stories', 'bigStats', 'trust', 'industries', 'cta', 'faqs'];
app.put('/api/admin/content', ...can('content:write'), (req, res) => {
  const db = read();
  const patch = req.body || {};
  for (const key of Object.keys(patch)) {
    if (CONTENT_KEYS.includes(key)) db.content[key] = patch[key];
  }
  write(db);
  res.json(db.content);
});

app.put('/api/admin/settings', ...can('settings:manage'), (req, res) => {
  const db = read();
  const { whatsapp, contact, social, legal } = req.body || {};
  if (whatsapp !== undefined) db.settings.whatsapp = sanitize(String(whatsapp), 30);
  if (contact)  db.settings.contact = { phone: sanitize(contact.phone, 50), email: sanitize(contact.email, 200), address: sanitize(contact.address, 300) };
  if (social)   db.settings.social  = { facebook: sanitize(social.facebook, 300), instagram: sanitize(social.instagram, 300), linkedin: sanitize(social.linkedin, 300), twitter: sanitize(social.twitter, 300) };
  if (legal)    db.settings.legal   = { privacyUrl: sanitize(legal.privacyUrl, 300), termsUrl: sanitize(legal.termsUrl, 300) };
  write(db);
  res.json(db.settings);
});

app.post('/api/admin/reset', ...can('settings:manage'), (_req, res) => res.json({ ok: true, db: reset() }));

// Public endpoint for available permissions list (for role builder UI)
app.get('/api/admin/permissions', auth, (_req, res) => res.json(ALL_PERMISSIONS));

app.listen(PORT, () => console.log(`✅ Samagra API running on http://localhost:${PORT}`));
