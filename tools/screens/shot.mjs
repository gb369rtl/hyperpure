import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('out', { recursive: true });
const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000';

const browser = await chromium.launch();
const api = await browser.newContext();

// Gather data
const products = (await (await api.request.get(`${API}/api/products?limit=4`)).json()).items;
const pid = products[0].id;
const order = await (
  await api.request.post(`${API}/api/orders`, {
    data: {
      customer: { name: 'Demo Restaurant', phone: '9876512345', business: 'Demo Foods', address: '12 MG Road', city: 'Mumbai', pincode: '400001' },
      items: [{ id: products[0].id, qty: 20 }, { id: products[1].id, qty: 15 }],
    },
  })
).json();
const token = (await (await api.request.post(`${API}/api/admin/login`, { data: { username: 'admin', password: 'admin123' } })).json()).token;

const quoteSeed = products.slice(0, 3).map((p) => ({ ...p, qty: 10 }));

async function ctx({ dark = false, viewport = { width: 1440, height: 900 }, authed = false, quote = false }) {
  const c = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await c.addInitScript(
    ([d, t, q, qs]) => {
      if (d) localStorage.setItem('hp_theme', 'dark');
      else localStorage.setItem('hp_theme', 'light');
      if (t) localStorage.setItem('hp_admin_token', t);
      if (q) localStorage.setItem('hp_quote', JSON.stringify(qs));
    },
    [dark, authed ? token : '', quote, quoteSeed],
  );
  return c;
}

async function shoot(c, path, file, full = true) {
  const page = await c.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  // Auto-scroll so IntersectionObserver reveals fire before capture
  if (full) {
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          let y = 0;
          const step = () => {
            window.scrollBy(0, 250);
            y += 250;
            if (y < document.body.scrollHeight) setTimeout(step, 130);
            else {
              window.scrollTo(0, 0);
              setTimeout(resolve, 400);
            }
          };
          step();
        }),
    );
  }
  await page.waitForTimeout(700);
  await page.screenshot({ path: `out/${file}`, fullPage: full });
  await page.close();
  console.log('shot', file);
}

// ---- light public ----
const light = await ctx({ dark: false });
await shoot(light, '/', 'hero-light.png', false);
await shoot(light, '/', 'home-light.png');
await shoot(light, '/catalogue', 'catalogue-light.png');
await shoot(light, `/product/${pid}`, 'product-light.png');
await shoot(light, '/track', 'track-light.png', false);
await shoot(light, `/order/${order.id}`, 'order-light.png');

// ---- dark public ----
const dark = await ctx({ dark: true });
await shoot(dark, '/', 'home-dark.png');
await shoot(dark, '/catalogue', 'catalogue-dark.png');
await shoot(dark, `/product/${pid}`, 'product-dark.png');

// ---- checkout (needs quote) ----
const checkoutCtx = await ctx({ dark: false, quote: true });
await shoot(checkoutCtx, '/checkout', 'checkout-light.png');

// ---- admin (authed) ----
const adminLight = await ctx({ dark: false, authed: true });
await shoot(adminLight, '/admin', 'admin-dashboard-light.png');
await shoot(adminLight, '/admin/orders', 'admin-orders-light.png');
await shoot(adminLight, '/admin/categories', 'admin-categories-light.png');

const adminDark = await ctx({ dark: true, authed: true });
await shoot(adminDark, '/admin', 'admin-dashboard-dark.png');
await shoot(adminDark, '/admin/products', 'admin-products-dark.png');

// ---- mobile ----
const mobile = await ctx({ dark: false, viewport: { width: 390, height: 844 } });
await shoot(mobile, '/catalogue', 'catalogue-mobile.png');

await browser.close();
console.log('done');
