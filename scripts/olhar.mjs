// Captura rápida para revisão: node scripts/olhar.mjs <url> <saida-prefixo> [largura] [altura] [rolagens...]
// Ex.: node scripts/olhar.mjs "http://localhost:5190/?hora=09:12&dia=sab" docs/_tmp/d 1440 900 0 900 1800
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const [url, saida, w = '1440', h = '900', ...rolagens] = process.argv.slice(2);
await mkdir(dirname(saida), { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const erros = [];
page.on('pageerror', (e) => erros.push(String(e)));
page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3200);
const alvos = rolagens.length ? rolagens : ['0'];
for (const y of alvos) {
  await page.evaluate(async (y) => {
    window.scrollTo(0, Number(y));
    await new Promise((r) => setTimeout(r, 150));
    window.scrollTo(0, Number(y));
  }, y);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${saida}-${y}.png` });
}
console.log('altura total', await page.evaluate(() => document.documentElement.scrollHeight));
if (erros.length) console.log('ERROS:\n' + erros.join('\n'));
await browser.close();
