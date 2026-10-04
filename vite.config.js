import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Dimensões dos originais (gravadas por scripts/otimizar-imagens.mjs) para width/height corretos e zero CLS.
const DIMS = JSON.parse(readFileSync(fileURLToPath(new URL('./scripts/dimensoes.json', import.meta.url)), 'utf8'));
const LARGURAS = [480, 800, 1200, 1600, 2400];

const icone = (nome) =>
  readFileSync(
    fileURLToPath(new URL(`./node_modules/@phosphor-icons/core/assets/bold/${nome}-bold.svg`, import.meta.url)),
    'utf8',
  ).replace('<svg ', '<svg aria-hidden="true" focusable="false" class="ico" ');

const attr = (tag, nome) => (tag.match(new RegExp(`\\b${nome}="([^"]*)"`)) || [])[1];

/**
 * <foto nome="levain" alt="..." sizes="..." class="..." eager></foto>
 *   -> <picture> com AVIF + WebP responsivos e width/height reais.
 * <i data-icon="whatsapp-logo"></i> -> SVG inline do Phosphor (bold).
 */
function htmlHelpers() {
  return {
    name: 'sereno-html-helpers',
    transformIndexHtml(html) {
      html = html.replace(/<i data-icon="([a-z-]+)"><\/i>/g, (_, n) => icone(n));
      html = html.replace(/<foto\b([^>]*)><\/foto>/g, (_, a) => {
        const nome = attr(a, 'nome');
        const alt = attr(a, 'alt') ?? '';
        const sizes = attr(a, 'sizes') ?? '100vw';
        const cls = attr(a, 'class');
        const eager = /\beager\b/.test(a);
        if (!DIMS[nome]) throw new Error(`foto desconhecida: ${nome}`);
        const [w0, h0] = DIMS[nome];
        const h = Math.round((2400 * h0) / w0);
        const set = (ext) => LARGURAS.map((w) => `/img/${nome}-${w}.${ext} ${w}w`).join(', ');
        return (
          `<picture${cls ? ` class="${cls}"` : ''}>` +
          `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
          `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
          `<img src="/img/${nome}-1200.webp" alt="${alt}" width="1200" height="${Math.round((1200 * h) / 2400)}"` +
          ` ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` +
          `</picture>`
        );
      });
      return html;
    },
  };
}

/** No build, o CSS (≈7 KB gzip) vai inline no HTML: some o pedido que bloqueia a renderização. */
function cssInline() {
  return {
    name: 'sereno-css-inline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = Object.values(bundle).find((f) => f.fileName === 'index.html');
      const css = Object.values(bundle).filter((f) => f.fileName.endsWith('.css'));
      if (!html || !css.length) return;
      let src = String(html.source);
      for (const f of css) {
        const tag = new RegExp(`<link rel="stylesheet"[^>]*href="/${f.fileName}"[^>]*>`);
        src = src.replace(tag, () => `<style>${f.source}</style>`);
        delete bundle[f.fileName];
      }
      html.source = src;
    },
  };
}

/** As fichas de proveniência (*.json ao lado de cada imagem) ficam no repositório, não no site publicado. */
function semFichas() {
  return {
    name: 'sereno-sem-fichas',
    apply: 'build',
    async closeBundle() {
      const { readdir, rm } = await import('node:fs/promises');
      for (const dir of ['dist', 'dist/img', 'dist/video']) {
        for (const a of await readdir(dir).catch(() => [])) {
          if (/\.(webp|avif|png|jpe?g)\.json$/.test(a)) await rm(`${dir}/${a}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [htmlHelpers(), cssInline(), semFichas()],
  build: { target: 'es2020', cssCodeSplit: false, assetsInlineLimit: 0 },
  server: { port: 5190 },
  preview: { port: 4190 },
});
