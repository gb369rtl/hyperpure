import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { read, write, reset } from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'samagra-dev-secret-change-me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const MIN_ORDER = 1000;
const ORDER_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

// Warn loudly in production if secrets are still defaults
if (process.env.NODE_ENV === 'production') {
  if (JWT_SECRET === 'samagra-dev-secret-change-me') console.warn('⚠️  JWT_SECRET is using the default dev value — set a strong secret in .env');
  if (ADMIN_PASS === 'admin123') console.warn('⚠️  ADMIN_PASS is using the default "admin123" — set a strong password in .env');
}

// ---------- security middleware ----------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // API-only; no HTML served
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : true; // true = allow all in dev; set ALLOWED_ORIGINS in production

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '100kb' }));

// Rate limiters
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many login attempts. Try again in 15 minutes.' } });
const writeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Try again later.' } });
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many reviews. Try again later.' } });

app.use(limiter);

// ---------- helpers ----------
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

// Sanitize a string: trim and cap length
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
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.includes(q) || (p.keyword || '').includes(q),
    );
  }

  const prices = items.map((p) => p.price);
  const facets = {
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };

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
  else if (sort === 'discount')
    items = [...items].sort((a, b) => (b.mrp - b.price) / (b.mrp || 1) - (a.mrp - a.price) / (a.mrp || 1));

  const result = paginate(items, page, limit);
  // Strip reviewsList from list view for performance
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

// ---------- reviews (public: read + submit) ----------
app.get('/api/products/:id/reviews', (req, res) => {
  const db = read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const reviews = (product.reviewsList || []).filter((r) => r.status === 'approved');
  res.json(paginate(reviews, req.query.page, req.query.limit, 10));
});

app.post('/api/products/:id/reviews', reviewLimiter, (req, res) => {
  const db = read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  const name = sanitize(req.body?.name, 80);
  const text = sanitize(req.body?.text, 1000);
  const rating = Math.min(5, Math.max(1, Number(req.body?.rating) || 0));

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!text || text.length < 10) return res.status(400).json({ error: 'Review must be at least 10 characters' });
  if (!rating) return res.status(400).json({ error: 'Rating (1-5) is required' });

  const review = {
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    name,
    text,
    rating,
    status: 'pending', // admin approves before going live
    createdAt: new Date().toISOString(),
  };

  if (!product.reviewsList) product.reviewsList = [];
  product.reviewsList.unshift(review);
  write(db);
  res.status(201).json({ ok: true, message: 'Your review has been submitted and will appear after approval.' });
});

// ---------- leads ----------
app.post('/api/leads', writeLimiter, (req, res) => {
  const name = sanitize(req.body?.name, 100);
  const phone = sanitize(req.body?.phone, 20);
  const business = sanitize(req.body?.business, 150);
  const type = sanitize(req.body?.type, 30);
  const message = sanitize(req.body?.message, 500);

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number' });

  const db = read();
  const lead = {
    id: crypto.randomUUID(),
    name,
    phone,
    business,
    type: type || 'callback',
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  db.leads.unshift(lead);
  write(db);
  res.status(201).json({ ok: true, lead });
});

// ---------- orders (guest checkout) ----------
app.post('/api/orders', writeLimiter, (req, res) => {
  const { customer, items, notes } = req.body || {};
  const name = sanitize(customer?.name, 100);
  const phone = sanitize(customer?.phone, 20);

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!/^[\d\s\+\-\(\)]{7,20}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Your cart is empty' });
  if (items.length > 200) return res.status(400).json({ error: 'Too many items in cart' });

  const db = read();
  const lineItems = items.map((i) => {
    const p = db.products.find((x) => x.id === i.id);
    const price = p ? p.price : 0; // always use server price, ignore client price
    const qty = Math.min(9999, Math.max(1, Number(i.qty) || 1));
    return {
      id: i.id,
      name: p?.name || sanitize(i.name, 100),
      unit: p?.unit || sanitize(i.unit, 50),
      image: p?.image || '',
      price,
      qty,
      lineTotal: price * qty,
    };
  }).filter((i) => i.price > 0); // drop unknown products

  if (lineItems.length === 0) return res.status(400).json({ error: 'No valid products in cart' });
  const total = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  if (total < MIN_ORDER) return res.status(400).json({ error: `Minimum order value is ₹${MIN_ORDER}.` });

  const order = {
    id: 'SM' + Date.now().toString(36).toUpperCase(),
    status: 'placed',
    customer: {
      name,
      phone,
      business: sanitize(customer.business, 150),
      address: sanitize(customer.address, 300),
      city: sanitize(customer.city, 100),
      pincode: sanitize(customer.pincode, 10),
    },
    items: lineItems,
    itemCount: lineItems.reduce((s, i) => s + i.qty, 0),
    total,
    notes: sanitize(notes, 500),
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

app.post('/api/orders/track', writeLimiter, (req, res) => {
  const id = sanitize(req.body?.id, 30);
  const phone = sanitize(req.body?.phone, 20);

  if (!id && !phone) return res.status(400).json({ error: 'Provide an order ID or phone number to track' });

  let orders = read().orders;
  if (id) orders = orders.filter((o) => o.id.toLowerCase() === id.toLowerCase());
  if (phone) orders = orders.filter((o) => o.customer.phone === phone);
  // Limit exposure: return at most 20 orders, never full item details in list
  res.json(orders.slice(0, 20).map((o) => ({
    id: o.id,
    status: o.status,
    createdAt: o.createdAt,
    total: o.total,
    itemCount: o.itemCount,
    customer: { name: o.customer.name, phone: o.customer.phone },
  })));
});

// ---------- admin auth ----------
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token, user: { username, role: 'admin' } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/admin/me', auth, (req, res) => res.json({ user: req.user }));

app.get('/api/admin/overview', auth, (_req, res) => {
  const db = read();
  const active = db.orders.filter((o) => o.status !== 'cancelled');
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const allReviews = db.products.flatMap((p) => p.reviewsList || []);
  res.json({
    products: db.products.length,
    categories: db.categories.length,
    leads: db.leads.length,
    newLeads: db.leads.filter((l) => l.status === 'new').length,
    orders: db.orders.length,
    pendingOrders: db.orders.filter((o) => ['placed', 'confirmed', 'packed', 'shipped'].includes(o.status)).length,
    revenue,
    inStock: db.products.filter((p) => p.inStock).length,
    pendingReviews: allReviews.filter((r) => r.status === 'pending').length,
  });
});

// ---------- admin: products CRUD ----------
app.post('/api/products', auth, (req, res) => {
  const b = req.body || {};
  const name = sanitize(b.name, 150);
  if (!name || !b.category) return res.status(400).json({ error: 'name and category required' });
  const db = read();
  const slug = slugify(name);
  const product = {
    id: slug + '-' + crypto.randomUUID().slice(0, 6),
    name,
    slug,
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

app.put('/api/products/:id', auth, (req, res) => {
  const db = read();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  const current = db.products[idx];
  db.products[idx] = {
    ...current,
    name: b.name !== undefined ? sanitize(b.name, 150) : current.name,
    category: b.category !== undefined ? sanitize(b.category, 50) : current.category,
    unit: b.unit !== undefined ? sanitize(b.unit, 50) : current.unit,
    description: b.description !== undefined ? sanitize(b.description, 1000) : current.description,
    badge: b.badge !== undefined ? sanitize(b.badge, 30) : current.badge,
    image: b.image !== undefined ? sanitize(b.image, 500) : current.image,
    keyword: b.keyword !== undefined ? sanitize(b.keyword, 100) : current.keyword,
    price: b.price !== undefined ? Number(b.price) : current.price,
    mrp: b.mrp !== undefined ? Number(b.mrp) : current.mrp,
    rating: b.rating !== undefined ? Number(b.rating) : current.rating,
    reviews: b.reviews !== undefined ? Number(b.reviews) : current.reviews,
    inStock: b.inStock !== undefined ? Boolean(b.inStock) : current.inStock,
    id: current.id,
    reviewsList: current.reviewsList || [],
  };
  write(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', auth, (req, res) => {
  const db = read();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: 'Not found' });
  write(db);
  res.json({ ok: true });
});

// ---------- admin: categories ----------
app.post('/api/categories', auth, (req, res) => {
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

app.put('/api/categories/:id', auth, (req, res) => {
  const db = read();
  const cat = db.categories.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  if (req.body.name !== undefined) cat.name = sanitize(req.body.name, 100);
  if (req.body.tagline !== undefined) cat.tagline = sanitize(req.body.tagline, 200);
  if (req.body.image !== undefined) cat.image = sanitize(req.body.image, 500);
  write(db);
  res.json(cat);
});

app.delete('/api/categories/:id', auth, (req, res) => {
  const db = read();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  write(db);
  res.json({ ok: true });
});

// ---------- admin: reviews ----------
app.get('/api/admin/reviews', auth, (req, res) => {
  const { status, search, page, limit } = req.query;
  const db = read();
  let reviews = db.products.flatMap((p) =>
    (p.reviewsList || []).map((r) => ({ ...r, productId: p.id, productName: p.name }))
  );
  if (status && status !== 'all') reviews = reviews.filter((r) => r.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    reviews = reviews.filter((r) =>
      r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q)
    );
  }
  reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(paginate(reviews, page, limit, 15));
});

app.put('/api/admin/reviews/:productId/:reviewId', auth, (req, res) => {
  const { productId, reviewId } = req.params;
  const db = read();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const review = (product.reviewsList || []).find((r) => r.id === reviewId);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  const newStatus = req.body?.status;
  if (!['approved', 'rejected', 'pending'].includes(newStatus))
    return res.status(400).json({ error: 'status must be approved, rejected, or pending' });

  review.status = newStatus;

  // Recompute aggregate rating from approved reviews
  const approved = (product.reviewsList || []).filter((r) => r.status === 'approved');
  if (approved.length > 0) {
    product.rating = Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10;
    product.reviews = approved.length;
  }

  write(db);
  res.json(review);
});

app.delete('/api/admin/reviews/:productId/:reviewId', auth, (req, res) => {
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

// ---------- admin: leads ----------
app.get('/api/admin/leads', auth, (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().leads;
  if (status && status !== 'all') items = items.filter((l) => l.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    items = items.filter((l) => `${l.name} ${l.phone} ${l.business}`.toLowerCase().includes(q));
  }
  res.json(paginate(items, page, limit, 10));
});

app.put('/api/admin/leads/:id', auth, (req, res) => {
  const db = read();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Not found' });
  if (req.body.status) lead.status = sanitize(req.body.status, 20);
  write(db);
  res.json(lead);
});

// ---------- admin: orders ----------
app.get('/api/admin/orders', auth, (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().orders;
  if (status && status !== 'all') items = items.filter((o) => o.status === status);
  if (search) {
    const q = sanitize(search, 100).toLowerCase();
    items = items.filter((o) =>
      `${o.id} ${o.customer.name} ${o.customer.phone} ${o.customer.business}`.toLowerCase().includes(q),
    );
  }
  res.json(paginate(items, page, limit, 10));
});

app.put('/api/admin/orders/:id', auth, (req, res) => {
  const db = read();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (req.body.status && ORDER_STATUSES.includes(req.body.status)) order.status = req.body.status;
  write(db);
  res.json(order);
});

// ---------- admin: content ----------
app.put('/api/admin/content', auth, (req, res) => {
  const body = req.body || {};
  const db = read();
  db.content = { ...db.content, ...body };
  write(db);
  res.json(db.content);
});

app.post('/api/admin/reset', auth, (_req, res) => res.json({ ok: true, db: reset() }));

app.listen(PORT, () => console.log(`✅ Samagra API running on http://localhost:${PORT}`));
