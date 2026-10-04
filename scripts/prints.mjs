// Prova visual: um print por seção, desktop (1440×900) e celular (390×844, 2x), em docs/prints/.
// Uso: npm run build && npm run preview  (em outro terminal)  →  npm run prints
// Horário fixo (?hora=09:12&dia=sab) para o quadro de fornadas sair sempre igual.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.URL || 'http://localhost:4190/';
const url = `${BASE}?hora=09:12&dia=sab`;
const SECOES = [
  ['01-hero', '#inicio', 0],
  ['02-fornadas', '#fornadas', 0],
  ['03-faixa-e-processo', '.faixa', -120],
  ['04-processo-36h', '#processo', 'meio'],
  ['05-do-nordeste', '#nordeste', 0],
  ['05b-do-nordeste-blocos', '.nd-cafe', -140],
  ['06-cardapio', '#cardapio', 0],
  ['06b-menu-sobre-papel', '#cardapio', 'sobe'],
  ['07-depoimentos', '#vizinhos', 0],
  ['08-visite', '#visite', 0],
  ['09-rodape', 'footer', 'fim'],
];
const TELAS = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
];

await mkdir('docs/prints', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [nome, opts] of TELAS) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500); // abertura do letreiro
  for (const [arquivo, sel, ajuste] of SECOES) {
    const y = await page.evaluate(
      ([sel, ajuste]) => {
        const el = document.querySelector(sel);
        const spacer = el.closest('.pin-spacer') || el.querySelector('.pin-spacer') || el;
        const topo = spacer.getBoundingClientRect().top + window.scrollY;
        if (ajuste === 'meio') return topo + (spacer.offsetHeight - innerHeight) * 0.45;
        if (ajuste === 'fim') return document.documentElement.scrollHeight - innerHeight;
        if (ajuste === 'sobe') return topo + 260;
        return topo + ajuste;
      },
      [sel, ajuste],
    );
    // rola em passos para disparar as animações de entrada no caminho
    await page.evaluate(async (alvo) => {
      const passo = Math.sign(alvo - scrollY) * 500;
      while (Math.abs(alvo - scrollY) > 520) {
        window.scrollBy(0, passo);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, alvo);
    }, y);
    await page.waitForTimeout(2200);
    if (ajuste === 'sobe') {
      // sobe um pouco: o menu reaparece, já com fundo e desfoque, sobre a seção clara
      await page.mouse.move(400, 400);
      await page.mouse.wheel(0, -160);
      await page.waitForTimeout(1400);
    }
    if (arquivo === '01-hero') {
      // espera o relógio estar parado entre duas trocas de cena
      await page.waitForFunction(() => {
        const h = document.querySelector('[data-relogio-hora]');
        const t = document.querySelector('.hero-video').currentTime % 9;
        return getComputedStyle(h).opacity === '1' && ((t > 0.6 && t < 2.3) || (t > 4.2 && t < 5.2) || (t > 7.2 && t < 8.2));
      }, null, { timeout: 20000, polling: 100 }).catch(() => {});
    }
    await page.screenshot({ path: `docs/prints/${nome}-${arquivo}.png` });
    console.log(nome, arquivo);
  }
  await ctx.close();
}
await browser.close();
