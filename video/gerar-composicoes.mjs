// Gera as duas composições HyperFrames do hero (direção B · Madrugada) no espaço do Estúdio Criativo:
//   X:\Projetos\estudio-criativo\hyperframes\sereno-madrugada           1920×1080 (16:9)
//   X:\Projetos\estudio-criativo\hyperframes\sereno-madrugada-vertical  1080×1920 (9:16)
// O vídeo só traz imagem e luz; o relógio, o texto e a linha do tempo ficam no HTML da página,
// sincronizados com o tempo do vídeo (cenas: 0 s cestos · 3 s forno · 6 s croissant · 9 s volta ao início).
// Uso: node video/gerar-composicoes.mjs   (depois: hf lint / hf inspect / hf render em cada pasta)
import { writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ESTUDIO = 'X:/Projetos/estudio-criativo/hyperframes';
const GRADE =
  'colorbalance=rs=0.07:gs=0.015:bs=-0.07:rm=0.05:bm=-0.05:rh=0.025:bh=-0.035,eq=contrast=1.12:saturation=0.9:gamma=0.93:brightness=-0.03';
const CENAS = [
  { id: 'f1', foto: 'cestos', h: { pos: '50% 48%' }, v: { pos: '50% 50%' } },
  { id: 'f2', foto: 'fogo', h: { pos: '40% 46%' }, v: { pos: '38% 50%' } },
  { id: 'f3', foto: 'croissant-farinha', h: { pos: '50% 60%' }, v: { pos: '42% 60%' } },
  { id: 'f4', foto: 'cestos', arquivo: 'cestos-loop', h: { pos: '50% 48%' }, v: { pos: '50% 50%' } },
];

const html = (W, H, orient, vivo) => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Sereno · madrugada (${orient})</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      :root { --preto: #14100d; --brasa: #d9774a; --papel: #ede4d6; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--preto); }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: var(--preto); }
      .cena { position: absolute; inset: 0; overflow: hidden; z-index: 1; }
      .camadas { position: absolute; inset: 0; overflow: hidden; z-index: 3; pointer-events: none; }
      #forno-vivo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; opacity: 0; }
      .foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; }
${CENAS.map((c) => `      #${c.id} { object-position: ${c[orient === 'horizontal' ? 'h' : 'v'].pos}; }`).join('\n')}
      #f1 { opacity: 1; }
      .vinheta {
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 75% 70% at 50% 50%, rgba(20, 16, 13, 0) 45%, rgba(20, 16, 13, 0.62) 100%);
      }
      .luz {
        position: absolute; inset: 0; pointer-events: none; opacity: 0; mix-blend-mode: screen;
        background: radial-gradient(ellipse 60% 55% at 70% 40%, rgba(217, 119, 74, 0.55), rgba(217, 119, 74, 0) 70%);
      }
      .poeira { position: absolute; inset: 0; pointer-events: none; }
      .p { position: absolute; left: 0; top: 0; border-radius: 50%; background: #f3e6cf; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="9" data-width="${W}" data-height="${H}">
      <div id="cena" class="clip cena" data-start="0" data-duration="9" data-track-index="0">
${CENAS.map((c) => `        <img class="foto" id="${c.id}" src="assets/${c.arquivo || c.foto}.jpg" alt="" />`).join('\n')}
      </div>${
        vivo
          ? `
      <video id="forno-vivo" src="assets/forno-vivo.mp4" data-start="2.7" data-duration="3.6" data-media-start="0" data-track-index="1" muted playsinline></video>`
          : ''
      }
      <div id="camadas" class="clip camadas" data-start="0" data-duration="9" data-track-index="2">
        <div class="luz" id="luz"></div>
        <div class="poeira" id="poeira" data-layout-ignore></div>
        <div class="vinheta"></div>
      </div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      const W = ${W}, H = ${H}, T = 9;

      // PRNG com semente (mulberry32): a poeira é sempre igual em todo render
      function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
      const rnd = mulberry32(2026);
      const poeira = document.getElementById('poeira');
      const N = ${orient === 'horizontal' ? 70 : 60};
      for (let i = 0; i < N; i++) {
        const d = document.createElement('div');
        d.className = 'p';
        const s = 1.2 + rnd() * 3.2;
        d.style.width = d.style.height = s + 'px';
        d.style.opacity = (0.12 + rnd() * 0.5).toFixed(2);
        if (rnd() < 0.35) d.style.filter = 'blur(' + (1 + rnd() * 2).toFixed(1) + 'px)';
        poeira.appendChild(d);
        const x0 = rnd() * W;
        const y0 = rnd() * (H + 40) - 20;
        // sobe exatamente uma altura inteira em 9 s e "dá a volta": o último quadro é igual ao primeiro
        const voltas = rnd() < 0.5 ? 1 : 2;
        tl.fromTo(d, { x: x0, y: y0 }, {
          y: y0 - (H + 40) * voltas, duration: T, ease: 'none',
          modifiers: { y: (y) => (((parseFloat(y) + 20) % (H + 40) + (H + 40)) % (H + 40)) - 20 + 'px' },
        }, 0);
        const amp = 6 + rnd() * 18;
        tl.fromTo(d, { xPercent: 0 }, { xPercent: amp, duration: T / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
      }

      // cenas: empurrão lento de câmera e fusões quentes
      tl.fromTo('#f1', { scale: 1 }, { scale: 1.07, duration: 3.3, ease: 'sine.inOut' }, 0);
      tl.fromTo('#f2', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', immediateRender: false }, 2.7);
      tl.fromTo('#f2', { scale: 1.1 }, { scale: 1.0, duration: 3.6, ease: 'sine.out', immediateRender: false }, 2.7);
      tl.set('#f1', { opacity: 0 }, 3.45);
      tl.fromTo('#f3', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', immediateRender: false }, 5.6);
      tl.fromTo('#f3', { scale: 1.0 }, { scale: 1.06, duration: 3.2, ease: 'sine.inOut', immediateRender: false }, 5.6);
      tl.set('#f2', { opacity: 0 }, 6.35);
${
  vivo
    ? `      // cena do forno com movimento real (Google Flow/Veo): entra em fusão e sai revelando a fornada
      tl.fromTo('#forno-vivo', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', immediateRender: false }, 2.7);
      tl.to('#forno-vivo', { opacity: 0, duration: 0.7, ease: 'sine.inOut' }, 5.6);
`
    : ''
}      tl.fromTo('#f4', { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'sine.inOut', immediateRender: false }, 8.3);
      // o brilho do forno respira nas trocas
      for (const t0 of [2.6, 5.5, 8.2]) {
        tl.fromTo('#luz', { opacity: 0 }, { opacity: 0.55, duration: 0.45, ease: 'sine.out', immediateRender: false }, t0);
        tl.to('#luz', { opacity: 0, duration: 0.6, ease: 'sine.in' }, t0 + 0.45);
      }

      window.__timelines['main'] = tl;
    </script>
  </body>
</html>
`;

const design = `# Sereno · madrugada (hero da landing, direção B)

## Style Prompt
Madrugada de padaria em clave baixa: fotos escuras e quentes (cestos de fermentação, forno a lenha aceso, croissant com farinha caindo), empurrão lento de câmera, poeira de farinha subindo na luz e um brilho de brasa que respira nas trocas de cena. Sem texto no vídeo: o relógio e as frases ficam no HTML da página, sincronizados.

## Colors
- \`#14100D\` café-preto (fundo e vinheta)
- \`#D9774A\` brasa (luz das trocas, em screen)
- \`#EDE4D6\` papel (poeira de farinha)

## Typography
Nenhuma no vídeo (o texto é HTML na página).

## What NOT to Do
- Nada de corte seco: toda troca é fusão com brilho de brasa.
- Nada de \`Math.random\` ou \`repeat: -1\`; poeira com semente e período exato de 9 s.
- Último quadro igual ao primeiro (loop sem emenda).
- Nada de gradiente linear de tela cheia (banding); só radiais.
`;

for (const [pasta, W, H, orient, larg] of [
  ['sereno-madrugada', 1920, 1080, 'horizontal', 2000],
  ['sereno-madrugada-vertical', 1080, 1920, 'vertical', 1400],
]) {
  const dir = join(ESTUDIO, pasta);
  await mkdir(join(dir, 'assets'), { recursive: true });
  // se existir a versão própria por IA (assets-src/ia/hero-*), ela substitui a foto de banco
  const ia = await readdir('assets-src/ia').catch(() => []);
  const IA = { cestos: 'hero-cestos', fogo: 'hero-forno', 'croissant-farinha': 'hero-fornada' };
  for (const f of ['cestos', 'fogo', 'croissant-farinha']) {
    const base = (a) => a.replace(/\.[a-z0-9]+$/i, '');
    const proprio = ia.find((a) => base(a) === IA[f] + (orient === 'vertical' ? '-9x16' : '-16x9')) || ia.find((a) => base(a) === IA[f]);
    const origem = proprio ? `assets-src/ia/${proprio}` : `assets-src/fotos/${f}.jpg`;
    // imagens próprias (IA) já vêm na paleta B; no 16:9 são espelhadas para o produto ficar à direita
    // e o título da página (embaixo, à esquerda) pousar sobre a parte escura
    const vf = proprio
      ? `scale=${larg}:-2:flags=lanczos${orient === 'horizontal' ? ',hflip' : ''}`
      : `scale=${larg}:-2:flags=lanczos,${GRADE}`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', origem, '-vf', vf, '-q:v', '3', join(dir, 'assets', `${f}.jpg`)]);
  }
  await copyFile(join(dir, 'assets', 'cestos.jpg'), join(dir, 'assets', 'cestos-loop.jpg'));
  // vídeo do Google Flow (Veo) para a cena do forno: só 0–3,7 s (antes de o braço entrar), sem áudio;
  // 16:9 espelhado como as imagens; 9:16 recortado no arco do forno
  const flow = 'assets-src/ia/video/flow-forno-16x9.mp4';
  const vivo = await readdir('assets-src/ia/video').then((a) => a.includes('flow-forno-16x9.mp4')).catch(() => false);
  if (vivo) {
    const vfv = orient === 'horizontal' ? 'hflip,scale=1920:1080:flags=lanczos' : 'crop=608:1080:310:0,scale=1080:1920:flags=lanczos';
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '0', '-t', '3.7', '-i', flow, '-an', '-vf', vfv,
      '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '30', join(dir, 'assets', 'forno-vivo.mp4')]);
  }
  await writeFile(join(dir, 'index.html'), html(W, H, orient, vivo));
  await writeFile(join(dir, 'DESIGN.md'), design);
  await mkdir(join('video', pasta), { recursive: true });
  await writeFile(join('video', pasta, 'index.html'), html(W, H, orient, vivo));
  await writeFile(join('video', pasta, 'DESIGN.md'), design);
  console.log(pasta, 'ok');
}
