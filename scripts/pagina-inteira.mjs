// Captura da página inteira em estado final (movimento reduzido) para revisão: .impeccable/review/
import { chromium } from 'playwright-core';
const BASE = process.env.URL || 'http://localhost:4190/';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [nome, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }], // dpr 1: o Chrome não captura acima de 16384 px
]) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(`${BASE}?hora=09:12&dia=sab`, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(800);
  console.log(nome, 'scrollHeight', await p.evaluate(() => document.documentElement.scrollHeight));
  await p.screenshot({ path: `.impeccable/review/${nome}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log('ok');
