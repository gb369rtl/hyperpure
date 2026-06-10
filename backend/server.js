import express from 'express';
import cors from 'cors';
import compression from 'compression';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { read, write, reset } from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'hyperpure-dev-secret-change-me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const MIN_ORDER = 1000;
const ORDER_STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

// ---------- public ----------
app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

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
    const q = String(search).toLowerCase();
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.includes(q) || p.keyword.includes(q),
    );
  }

  // Price bounds (facets) computed before price filtering so the slider stays stable.
  const prices = items.map((p) => p.price);
  const facets = {
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };

  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if (!Number.isNaN(minPrice)) items = items.filter((p) => p.price >= minPrice);
  if (!Number.isNaN(maxPrice)) items = items.filter((p) => p.price <= maxPrice);
  if (minRating) items = items.filter((p) => p.rating >= Number(minRating));
  if (inStock === 'true') items = items.filter((p) => p.inStock);
  if (badge === 'true') items = items.filter((p) => p.badge);

  if (sort === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount')
    items = [...items].sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);

  const result = paginate(items, page, limit);
  res.json({ ...result, facets });
});

app.get('/api/products/:id', (req, res) => {
  const db = read();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const related = db.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);
  res.json({ ...product, related });
});

// Leads: contact / request-callback / quote
app.post('/api/leads', (req, res) => {
  const { name, phone, business, type, message } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });
  const db = read();
  const lead = {
    id: crypto.randomUUID(),
    name,
    phone,
    business: business || '',
    type: type || 'callback',
    message: message || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  db.leads.unshift(lead);
  write(db);
  res.status(201).json({ ok: true, lead });
});

// ---------- orders (guest checkout) ----------
app.post('/api/orders', (req, res) => {
  const { customer, items, notes } = req.body || {};
  if (!customer?.name || !customer?.phone)
    return res.status(400).json({ error: 'Name and phone are required' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Your cart is empty' });

  const db = read();
  // Recompute prices from catalogue to prevent tampering.
  const lineItems = items.map((i) => {
    const p = db.products.find((x) => x.id === i.id);
    const price = p ? p.price : Number(i.price) || 0;
    const qty = Math.max(1, Number(i.qty) || 1);
    return {
      id: i.id,
      name: p?.name || i.name,
      unit: p?.unit || i.unit || '',
      image: p?.image || i.image || '',
      price,
      qty,
      lineTotal: price * qty,
    };
  });
  const total = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  if (total < MIN_ORDER)
    return res.status(400).json({ error: `Minimum order value is ₹${MIN_ORDER}.` });

  const order = {
    id: 'HP' + Date.now().toString(36).toUpperCase(),
    status: 'placed',
    customer: {
      name: customer.name,
      phone: customer.phone,
      business: customer.business || '',
      address: customer.address || '',
      city: customer.city || '',
      pincode: customer.pincode || '',
    },
    items: lineItems,
    itemCount: lineItems.reduce((s, i) => s + i.qty, 0),
    total,
    notes: notes || '',
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

app.post('/api/orders/track', (req, res) => {
  const { phone, id } = req.body || {};
  let orders = read().orders;
  if (id) orders = orders.filter((o) => o.id.toLowerCase() === String(id).toLowerCase());
  if (phone) orders = orders.filter((o) => o.customer.phone.includes(String(phone)));
  res.json(orders);
});

// ---------- admin auth ----------
app.post('/api/admin/login', (req, res) => {
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
  res.json({
    products: db.products.length,
    categories: db.categories.length,
    leads: db.leads.length,
    newLeads: db.leads.filter((l) => l.status === 'new').length,
    orders: db.orders.length,
    pendingOrders: db.orders.filter((o) => ['placed', 'confirmed', 'packed', 'shipped'].includes(o.status)).length,
    revenue,
    inStock: db.products.filter((p) => p.inStock).length,
  });
});

// ---------- admin: products CRUD ----------
app.post('/api/products', auth, (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.category) return res.status(400).json({ error: 'name and category required' });
  const db = read();
  const slug = slugify(b.name);
  const product = {
    id: slug + '-' + crypto.randomUUID().slice(0, 6),
    name: b.name,
    slug,
    category: b.category,
    unit: b.unit || '1 unit',
    price: Number(b.price) || 0,
    mrp: Number(b.mrp) || Number(b.price) || 0,
    rating: Number(b.rating) || 4.5,
    reviews: Number(b.reviews) || 0,
    badge: b.badge || '',
    inStock: b.inStock !== false,
    image: b.image || `https://loremflickr.com/600/600/${encodeURIComponent(b.keyword || 'food')}`,
    keyword: b.keyword || 'food',
    description: b.description || `Premium quality ${b.name}.`,
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
    ...b,
    price: b.price !== undefined ? Number(b.price) : current.price,
    mrp: b.mrp !== undefined ? Number(b.mrp) : current.mrp,
    rating: b.rating !== undefined ? Number(b.rating) : current.rating,
    reviews: b.reviews !== undefined ? Number(b.reviews) : current.reviews,
    id: current.id,
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
  if (!b.name) return res.status(400).json({ error: 'name required' });
  const db = read();
  const id = b.id || slugify(b.name);
  if (db.categories.some((c) => c.id === id)) return res.status(409).json({ error: 'Category exists' });
  const category = { id, name: b.name, tagline: b.tagline || '', image: b.image || `https://loremflickr.com/600/600/${encodeURIComponent(b.keyword || 'food')}` };
  db.categories.push(category);
  write(db);
  res.status(201).json(category);
});

app.put('/api/categories/:id', auth, (req, res) => {
  const db = read();
  const cat = db.categories.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  Object.assign(cat, { name: req.body.name ?? cat.name, tagline: req.body.tagline ?? cat.tagline, image: req.body.image ?? cat.image });
  write(db);
  res.json(cat);
});

app.delete('/api/categories/:id', auth, (req, res) => {
  const db = read();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  write(db);
  res.json({ ok: true });
});

// ---------- admin: leads ----------
app.get('/api/admin/leads', auth, (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().leads;
  if (status && status !== 'all') items = items.filter((l) => l.status === status);
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((l) => `${l.name} ${l.phone} ${l.business}`.toLowerCase().includes(q));
  }
  res.json(paginate(items, page, limit, 10));
});

app.put('/api/admin/leads/:id', auth, (req, res) => {
  const db = read();
  const lead = db.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Not found' });
  if (req.body.status) lead.status = req.body.status;
  write(db);
  res.json(lead);
});

// ---------- admin: orders ----------
app.get('/api/admin/orders', auth, (req, res) => {
  const { search, status, page, limit } = req.query;
  let items = read().orders;
  if (status && status !== 'all') items = items.filter((o) => o.status === status);
  if (search) {
    const q = String(search).toLowerCase();
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

// ---------- admin: editable site content (banner, stats, features, faqs, …) ----------
app.put('/api/admin/content', auth, (req, res) => {
  const body = req.body || {};
  const db = read();
  // Shallow-merge top-level sections; admin sends a complete section to replace it.
  db.content = { ...db.content, ...body };
  write(db);
  res.json(db.content);
});

app.post('/api/admin/reset', auth, (_req, res) => res.json({ ok: true, db: reset() }));

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
