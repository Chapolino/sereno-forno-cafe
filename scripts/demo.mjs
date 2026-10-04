// Vídeo de demonstração rolando a página inteira (CDP screencast + ffmpeg).
// Uso: npm run build && npm run preview (outro terminal) → node scripts/demo.mjs desktop|mobile
// Saída: docs/demo-desktop.mp4 ou docs/demo-mobile.mp4 (H.264, 30 fps, ≤ 60 s)
import { chromium } from 'playwright-core';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const modo = process.argv[2] === 'mobile' ? 'mobile' : 'desktop';
const BASE = process.env.URL || 'http://localhost:4190/';
const url = `${BASE}?hora=09:12&dia=sab`;
const tmp = join('docs', '_tmp', `quadros-${modo}`);
await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });

const opts =
  modo === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext(opts);
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);

const quadros = [];
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const n = quadros.length;
  const arq = join(tmp, `q${String(n).padStart(5, '0')}.jpg`);
  quadros.push({ arq, t: metadata.timestamp });
  writeFile(arq, Buffer.from(data, 'base64'));
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});

await page.goto('about:blank');
const [w, h] = modo === 'mobile' ? [780, 1688] : [1440, 900];
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: w, maxHeight: h, everyNthFrame: 1 });
await page.goto(url, { waitUntil: 'domcontentloaded' });

const espera = (ms) => page.waitForTimeout(ms);
const { width, height } = opts.viewport;
await page.mouse.move(width / 2, height / 2);

/** rola até o topo de um seletor com passos de roda (deixa o Lenis suavizar) */
async function rolarAte(sel, extra = 0, passo = 110, intervalo = 55) {
  const alvo = await page.evaluate(
    ([s, e]) => {
      const el = document.querySelector(s);
      const sp = el.closest('.pin-spacer') || el;
      return sp.getBoundingClientRect().top + scrollY + e;
    },
    [sel, extra],
  );
  for (let i = 0; i < 400; i++) {
    const y = await page.evaluate(() => scrollY);
    const falta = alvo - y;
    if (Math.abs(falta) < passo) break;
    await page.mouse.wheel(0, Math.sign(falta) * passo);
    await espera(intervalo);
  }
  await espera(700);
}
async function rolar(px, passo = 110, intervalo = 55) {
  for (let feito = 0; feito < Math.abs(px); feito += passo) {
    await page.mouse.wheel(0, Math.sign(px) * passo);
    await espera(intervalo);
  }
}

await espera(3600); // abertura: letras em brasa, relógio dando partida, fagulhas
if (modo === 'desktop') {
  // a lamparina segue o cursor e o botão principal puxa o ponteiro (magnético, com reflexo)
  for (const [x, y] of [[620, 420], [900, 300], [700, 520], [400, 640], [190, 745], [215, 750], [250, 742], [420, 748]]) {
    await page.mouse.move(x, y, { steps: 14 });
    await espera(260);
  }
  await espera(900);
  await page.mouse.move(width / 2, height / 2, { steps: 12 });
}
await espera(600);
await rolarAte('#fornadas', -10);
await espera(2400); // plaquinhas viram
await rolar(modo === 'mobile' ? 1500 : 600);
await espera(600);
await rolarAte('#processo', 0);
// atravessa o pino horizontal das 36 horas
const pino = await page.evaluate(() => {
  const sp = document.querySelector('#processo').closest('.pin-spacer');
  return sp ? sp.offsetHeight - innerHeight : 2600;
});
await rolar(pino + 200, 70, 85);
await espera(500);
await rolarAte('#nordeste', -10);
await espera(1200);
await rolar(modo === 'mobile' ? 1700 : 700, 110, 60);
await rolarAte('#cardapio', modo === 'mobile' ? -10 : 40);
await espera(800);
if (modo === 'desktop') {
  for (const li of await page.$$('#painel-paes li')) {
    await li.hover();
    await espera(650);
  }
}
await page.click('#aba-cafe');
await espera(1500);
if (modo === 'mobile') {
  await rolar(500);
  await espera(800);
}
await rolarAte('#vizinhos', -10);
await espera(1500);
await page.click('[data-proximo]');
await espera(1800);
await rolarAte('#visite', -10);
await espera(2200);
await rolar(4000, 120, 60);
await espera(2200);

await cdp.send('Page.stopScreencast');
await espera(300);
await browser.close();

// monta a lista com as durações reais de cada quadro
const linhas = ['ffconcat version 1.0'];
for (let i = 0; i < quadros.length; i++) {
  const dur = i + 1 < quadros.length ? quadros[i + 1].t - quadros[i].t : 0.5;
  linhas.push(`file '${quadros[i].arq.split(/[\\/]/).pop()}'`, `duration ${Math.max(0.001, dur).toFixed(4)}`);
}
linhas.push(`file '${quadros.at(-1).arq.split(/[\\/]/).pop()}'`);
await writeFile(join(tmp, 'lista.txt'), linhas.join('\n'));
const saida = join('docs', `demo-${modo}.mp4`);
const escala = modo === 'mobile' ? 'scale=780:-2' : 'scale=1440:-2';
execFileSync('ffmpeg', [
  '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'lista.txt'),
  '-vf', `${escala},fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', modo === 'mobile' ? '27' : '22',
  '-movflags', '+faststart', '-t', '60', saida,
]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', saida]).toString().trim();
console.log(`${saida}: ${quadros.length} quadros capturados, ${Number(dur).toFixed(1)} s`);
