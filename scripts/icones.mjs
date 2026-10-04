// Gera favicons/ícones (PNG) e a imagem Open Graph a partir do próprio letreiro.
// Requer o servidor de dev rodando (npm run dev) e o Chrome instalado.
import { chromium } from 'playwright-core';
const base = process.argv[2] || 'http://localhost:5190';
const browser = await chromium.launch({ channel: 'chrome' });

// Ícones: "S" em Libre Caslon Display, papel sobre café-preto
const icone = (px) => `<!doctype html><html><head><style>
@font-face{font-family:L;src:url(${base}/fonts/libre-caslon-display-latin.woff2)}
html,body{margin:0;width:${px}px;height:${px}px;background:transparent}
div{width:${px}px;height:${px}px;border-radius:${px * 0.22}px;background:#14100D;display:grid;place-items:center;
font-family:L;font-size:${px * 0.86}px;line-height:1;color:#EDE4D6;padding-bottom:${px * 0.04}px;box-sizing:border-box}
</style></head><body><div>S</div></body></html>`;
for (const [px, nome] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  const p = await browser.newPage({ viewport: { width: px, height: px } });
  await p.setContent(icone(px));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: `public/${nome}`, omitBackground: true });
  await p.close();
}

// Open Graph 1200x630: o hero real da página, com movimento reduzido (estado final, sem animação)
const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
const p = await og.newPage();
await p.goto(`${base}/?hora=09:12&dia=sab`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
await p.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 84 });
await browser.close();
console.log('ícones e og.jpg gerados');
