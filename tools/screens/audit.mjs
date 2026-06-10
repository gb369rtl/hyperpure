import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('out', { recursive: true });
const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000';
const browser = await chromium.launch();
const apiCtx = await browser.newContext();
const products = (await (await apiCtx.request.get(`${API}/api/products?limit=4`)).json()).items;
const pid = products[0].id;
const quoteSeed = products.slice(0, 3).map((p) => ({ ...p, qty: 10 }));

async function audit(path, file, { quote = false, width = 390 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript((q) => { localStorage.setItem('hp_theme', 'light'); if (q) localStorage.setItem('hp_quote', JSON.stringify(q)); }, quote ? quoteSeed : null);
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.evaluate(() => new Promise((r) => { let y = 0; const s = () => { window.scrollBy(0, 250); y += 250; if (y < document.body.scrollHeight) setTimeout(s, 90); else { window.scrollTo(0, 0); setTimeout(r, 300); } }; s(); }));
  await page.waitForTimeout(500);

  const report = await page.evaluate((vw) => {
    const docW = document.documentElement.scrollWidth;
    const overflow = docW > vw + 1;
    // elements extending past the viewport
    const offenders = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 2 && r.width > 20 && r.width < vw * 3) {
        offenders.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0, 2).join('.')} (right ${Math.round(r.right)})`);
      }
    });
    // small tap targets
    let smallTargets = 0;
    document.querySelectorAll('a,button,input,select,[role=button]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40)) smallTargets++;
    });
    // tiny fonts
    const tiny = new Set();
    document.querySelectorAll('p,span,a,li,div,button').forEach((el) => {
      if (!el.textContent.trim()) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs && fs < 12) tiny.add(fs);
    });
    return { docW, overflow, offenders: [...new Set(offenders)].slice(0, 8), smallTargets, tinyFonts: [...tiny] };
  }, width);

  await page.screenshot({ path: `out/${file}`, fullPage: true });
  console.log(`\n=== ${path} (${width}px) ===`);
  console.log('horizontal overflow:', report.overflow, `(docW ${report.docW})`);
  if (report.offenders.length) console.log('overflowing:', report.offenders);
  console.log('tap targets <40px:', report.smallTargets, '| fonts <12px:', report.tinyFonts);
  await ctx.close();
}

await audit('/', 'm-home.png');
await audit('/', 'm-home-360.png', { width: 360 });
await audit('/catalogue', 'm-catalogue.png');
await audit(`/product/${pid}`, 'm-product.png');
await audit('/checkout', 'm-checkout.png', { quote: true });

await browser.close();
console.log('\ndone');
