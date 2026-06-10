# Hyperpure — B2B Grocery Procurement Platform

A modern, full-stack B2B grocery/procurement website inspired by [hyperpure.com](https://www.hyperpure.com/),
built with **React + Vite (frontend)**, **Node + Express (backend)**, and an integrated **Admin Panel**.

Green theme, procurement for Restaurants/Cafes/Hotels, with **dark mode**, scroll animations,
a full bulk-order checkout flow, order tracking, and a searchable/filterable/paginated admin.

---

## Project structure

```
grocery_website/
├── backend/                 Node + Express REST API (JSON file store, no DB install needed)
│   ├── server.js            API: products, orders, leads, categories, admin auth (JWT), pagination
│   ├── seedData.js          Products, categories & all landing-page content
│   └── store.js             JSON persistence (data/db.json, auto-created)
├── frontend/                React + Vite + Tailwind
│   └── src/
│       ├── components/      Navbar, Footer, ThemeToggle, Reveal, ProductCard, QuoteBar, Pagination, sections/*
│       ├── context/         QuoteContext (cart) + ThemeContext (dark mode)
│       ├── pages/           Home, Catalogue, ProductDetail, Checkout, OrderConfirmation, TrackOrder, admin/*
│       └── lib/             api.js, constants, icon map
└── tools/screens/           Playwright screenshot utility (dev only)
```

## Run locally

Two terminals:

```bash
# 1) Backend  -> http://localhost:5000
cd backend && npm install && npm start

# 2) Frontend -> http://localhost:5173
cd frontend && npm install && npm run dev
```

Vite proxies `/api/*` to the backend automatically.

## Pages
| URL | Description |
|-----|-------------|
| `/` | Landing page (hero, categories, AI assistant, comparison, stories, FAQ…) with scroll reveals |
| `/catalogue` | Search + filters (category, price, rating, stock) + sort + **pagination** + live quote |
| `/product/:id` | Product detail — gallery, **bulk quantity**, specs, trust, related products |
| `/checkout` | Bulk-order checkout — delivery details, payment method, editable summary |
| `/order/:id` | Order confirmation with status timeline |
| `/track` | Track an order by ID or phone |
| `/admin/login` | Admin login — **admin / admin123** |
| `/admin` | Dashboard: revenue, orders, pending, products, leads |
| `/admin/products` | Product CRUD — search, category filter, pagination |
| `/admin/orders` | Order management — search, status filter, status updates, pagination |
| `/admin/leads` | Lead/enquiry management — search, status filter, pagination |
| `/admin/categories` | Category CRUD |

## Feature highlights
- **Dark mode** — system-aware, toggle in navbar + admin, persisted, respects `prefers-color-scheme`.
- **Scroll-reveal animations** — IntersectionObserver-based, honours `prefers-reduced-motion`.
- **Bulk ordering** — quantity steppers + bulk presets, quote drawer, full checkout, COD/UPI/credit.
- **Orders & tracking** — real orders persisted, status pipeline, customer lookup.
- **Catalogue at scale** — server-side pagination, debounced search, faceted filters.
- **Admin panel** — searchable, filterable, paginated tables for products / orders / leads.
- **Internet-sourced images** with a 3-level fallback (URL → keyword photo → SVG) so nothing breaks.
- **Accessibility** — visible focus rings, AA contrast, keyboard nav, semantic inputs, tabular numerals.

## Built for scale (50k–100k daily users)
What's already in place:
- **gzip compression** (Express `compression`) on all API responses.
- **Server-side pagination** on every list endpoint (products, orders, leads) — never ships the full table.
- **Route-level code splitting** (`React.lazy`) — initial JS is ~69 KB gzip; admin/checkout/detail load on demand.
- **Debounced search** and lazy-loaded images to cut request volume and bandwidth.
- **Stateless JWT auth** — horizontally scalable, no server session store.

To take it to production scale, swap these in (architecture already supports it):
- Replace the JSON file store with **PostgreSQL** (products/orders/users) + indexes on category/status/phone.
- Add **Redis** for cart/session/hot-product caching and inventory locks.
- Move search to **Meilisearch/Typesense** for typo-tolerant, fast catalogue search.
- Put a **CDN** in front of images/static assets; run the API behind a load balancer with rate limiting.
- Add **Razorpay** (UPI/cards/COD) and OTP auth (MSG91/Firebase) for real payments and customer accounts.

## Configuration (backend env)
```
PORT=5000
JWT_SECRET=change-me
ADMIN_USER=admin
ADMIN_PASS=admin123
```
WhatsApp number is set in `frontend/src/lib/constants.js`.
