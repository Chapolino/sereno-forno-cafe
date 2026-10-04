import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { renderizarQuadro, statusLoja } from './fornadas.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
const semMovimento = () => reduzir.matches;
const ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)');
const celular = () => window.matchMedia('(max-width: 899px)').matches;

/* Assinatura de movimento (direção B · Madrugada)
   O visual é contido; o movimento não. Tudo fala de forno: letras que chegam em brasa e esfriam,
   luz que varre como a boca do forno, fagulhas que sobem, farinha que cai, massa que cresce,
   placas mecânicas que viram, a porta que abre. Entradas: expo.out. Mecânica: back.out. Mola: elastic. */
const ENTRA = 'expo.out';
const MECANICA = 'back.out(1.6)';
const QUENTE = '#ffb47e';
const QUENTE_DIA = '#b5501f';
const BRILHO = '0 0 0.22em rgba(255,140,70,0.9)';
const APAGADO = '0 0 0em rgba(255,140,70,0)';

// estado compartilhado: quanto o processo já amanheceu (0 = madrugada, 1 = dia)
const estado = { dia: 0 };

/* ------------------------------------------------------------------ */
/* Lenis + ScrollTrigger                                                */
/* ------------------------------------------------------------------ */
function iniciarLenis() {
  if (semMovimento()) return;
  const lenis = new Lenis({ duration: 1.15, anchors: { offset: -64 }, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------------ */
/* Partículas (módulo carregado só depois da abertura)                  */
/* ------------------------------------------------------------------ */
let modParticulas = null;
const particulas = () => (modParticulas ??= import('./particulas.js'));
const quandoOcioso = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 400));

function canvasEm(pai, classe) {
  const c = document.createElement('canvas');
  c.className = classe;
  c.setAttribute('aria-hidden', 'true');
  pai.append(c);
  return c;
}

/* ------------------------------------------------------------------ */
/* Dígitos que rolam como placa mecânica                                */
/* ------------------------------------------------------------------ */
function montarSlots(el, texto) {
  el.textContent = '';
  for (const c of texto) {
    if (/\d/.test(c)) {
      const slot = document.createElement('span');
      slot.className = 'dg';
      const fita = document.createElement('span');
      fita.className = 'dg-fita';
      const l = document.createElement('span');
      l.textContent = c;
      fita.append(l);
      slot.append(fita);
      el.append(slot);
    } else el.append(c);
  }
  el.dataset.valor = texto;
}
/** Rola cada dígito de `el` até `para`. voltas = giros extras completos. */
function rolar(el, para, { dur = 0.8, stagger = 0.06, ease = MECANICA, voltas = 0, deTras = true, de, limpar = false } = {}) {
  if (el._rolo) el._rolo.progress(1);
  const atual = de ?? el.dataset.valor ?? el.textContent.trim();
  if (!el.querySelector('.dg') || atual.length !== para.length || de) montarSlots(el, atual);
  const slots = $$('.dg', el);
  const alvo = [...para].filter((c) => /\d/.test(c));
  const tl = gsap.timeline({
    onComplete: () => {
      el._rolo = null;
      if (limpar) el.textContent = para;
    },
  });
  slots.forEach((slot, i) => {
    const fita = slot.firstChild;
    const a = Number(fita.firstChild.textContent);
    const b = Number(alvo[i]);
    const n = ((b - a + 10) % 10) + 10 * voltas;
    if (!n) return;
    for (let k = 1; k <= n; k++) {
      const l = document.createElement('span');
      l.textContent = (a + k) % 10;
      l.className = 'dg-prox';
      l.style.top = `${k * 100}%`;
      fita.append(l);
    }
    const ordem = deTras ? slots.length - 1 - i : i;
    tl.to(
      fita,
      {
        yPercent: -100 * n,
        duration: dur + Math.min(n, 12) * 0.035,
        ease,
        onComplete: () => {
          const l = document.createElement('span');
          l.textContent = b;
          fita.replaceChildren(l);
          gsap.set(fita, { yPercent: 0 });
        },
      },
      ordem * stagger,
    );
  });
  el.dataset.valor = para;
  el._rolo = tl;
  return tl;
}

/* ------------------------------------------------------------------ */
/* Quadro de fornadas + próxima fornada + status da loja                */
/* ------------------------------------------------------------------ */
const lista = $('[data-quadro-lista]');
function atualizarQuadro() {
  const info = renderizarQuadro(lista, $('[data-quadro-dia]'));
  $('[data-proxima-item]').textContent = info.proxima;
  statusLoja($('[data-status-loja]'), $('[data-status-texto]'), $$('.horarios [data-dias]'));
}
atualizarQuadro();
setInterval(atualizarQuadro, 60_000);

/* ------------------------------------------------------------------ */
/* Hero: vídeo HyperFrames (16:9 ou 9:16) + relógio sincronizado        */
/* ------------------------------------------------------------------ */
const video = $('.hero-video');
const botaoPausa = $('[data-pausa]');
let pausado = semMovimento();
const vertical = () => window.matchMedia('(max-aspect-ratio: 4/5)').matches;
let brasasHero = null;

function carregarVideo() {
  if (video.dataset.carregado) return;
  video.dataset.carregado = '1';
  const p = vertical() ? 'v' : 'h';
  for (const [src, type] of [
    [video.dataset[`${p}Webm`], 'video/webm'],
    [video.dataset[`${p}Mp4`], 'video/mp4'],
  ]) {
    const s = document.createElement('source');
    s.src = src;
    s.type = type;
    video.append(s);
  }
  video.preload = 'auto';
  video.load();
  video.addEventListener('playing', () => video.classList.add('tocando'), { once: true });
}
function tocar() {
  if (pausado || !window.__heroPronto) return;
  carregarVideo();
  video.play().catch(() => {});
}
function atualizarPausa() {
  botaoPausa.setAttribute('aria-pressed', String(pausado));
  $('.pausa-txt', botaoPausa).textContent = pausado ? 'Tocar vídeo' : 'Pausar vídeo';
}
botaoPausa.addEventListener('click', () => {
  pausado = !pausado;
  atualizarPausa();
  if (pausado) {
    video.pause();
    brasasHero?.pausar();
  } else {
    tocar();
    brasasHero?.tocar();
  }
});
atualizarPausa();
let heroVisivel = true;
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (st) => {
    heroVisivel = st.isActive;
    if (st.isActive) {
      tocar();
      if (!pausado) brasasHero?.tocar();
    } else {
      video.pause();
      brasasHero?.pausar();
    }
  },
});

// Cenas do vídeo (9 s): o relógio da página acompanha o que a câmera mostra
const CENAS = [
  { ate: 2.95, hora: '03:40', texto: 'A massa descansa.', pos: 0.1667 },
  { ate: 5.85, hora: '04:30', texto: 'O forno acende.', pos: 0.375 },
  { ate: 8.6, hora: '06:00', texto: 'Primeira fornada.', pos: 0.75 },
  { ate: 99, hora: '03:40', texto: 'A massa descansa.', pos: 0.1667 },
];
const horaEl = $('[data-relogio-hora]');
const legendaEl = $('[data-relogio-legenda]');
const marcaEl = $('[data-relogio-marca]');
let cenaAtual = 0;
function mostrarCena(i) {
  const c = CENAS[i];
  marcaEl.style.setProperty('--pos', c.pos);
  if ((horaEl.dataset.valor ?? horaEl.textContent) === c.hora && legendaEl.textContent === c.texto) return;
  if (semMovimento()) {
    horaEl.textContent = c.hora;
    legendaEl.textContent = c.texto;
    return;
  }
  // placa mecânica: cada dígito rola sozinho, da direita para a esquerda, e assenta com um tranco
  rolar(horaEl, c.hora, { dur: 0.75, stagger: 0.07 });
  gsap
    .timeline()
    .to(legendaEl, { yPercent: -110, opacity: 0, duration: 0.4, ease: 'power2.in' })
    .add(() => (legendaEl.textContent = c.texto))
    .fromTo(legendaEl, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: ENTRA });
  // o forno acende: a luz passa pelo título e as brasas ganham fôlego
  if (i === 1 && heroVisivel) {
    varrerTitulo();
    brasasHero?.sopro(-2.2);
  }
  marcaEl.classList.remove('pulsa');
  void marcaEl.offsetWidth;
  marcaEl.classList.add('pulsa');
}
function acompanharVideo() {
  const t = video.currentTime % 9;
  const i = CENAS.findIndex((c) => t < c.ate);
  if (i !== cenaAtual) {
    cenaAtual = i;
    mostrarCena(i);
  }
  if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(acompanharVideo);
}
if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(acompanharVideo);
else video.addEventListener('timeupdate', acompanharVideo);

/* luz do forno passando pelo título: uma onda de brasa corre letra a letra */
const h1 = $('.hero-h1');
let letrasH1 = null;
function varrerTitulo() {
  if (!letrasH1) return;
  gsap.to(letrasH1, {
    keyframes: { color: ['#ede4d6', '#ffcf9c', '#ede4d6'], textShadow: [APAGADO, '0 0 0.24em rgba(255,150,80,0.75)', APAGADO] },
    duration: 1.1,
    stagger: 0.028,
    ease: 'sine.inOut',
    overwrite: true,
  });
}

/* ------------------------------------------------------------------ */
/* Abertura                                                             */
/* ------------------------------------------------------------------ */
function abertura() {
  const liberar = () => {
    window.__heroPronto = true;
    if (ScrollTrigger.isInViewport($('.hero'))) tocar();
  };
  const entra = $$('.hero [data-entra]');
  if (semMovimento()) {
    gsap.set([...entra, '.relogio'], { opacity: 1 });
    gsap.set(h1, { visibility: 'visible' });
    liberar();
    return;
  }

  // título: letra a letra, cada uma chega em brasa e esfria até o papel.
  // Só divide com o Caslon carregado (senão as quebras de linha saem erradas) e trava a altura
  // durante a divisão: nada abaixo do título se mexe (CLS 0).
  const fonte = document.fonts?.check("1em 'Libre Caslon Display'")
    ? Promise.resolve()
    : Promise.race([document.fonts.load("1em 'Libre Caslon Display'"), new Promise((r) => setTimeout(r, 2500))]);
  fonte.then(() => tituloHero().play());
  aberturaResto(entra, liberar);
}
function tituloHero() {
  h1.style.height = h1.getBoundingClientRect().height + 'px';
  // sem máscara: as letras acendem no lugar (opacidade) e sobem um pouco, como fagulha
  const sp = SplitText.create(h1, { type: 'lines,words,chars', linesClass: 'linha', aria: 'auto', reduceWhiteSpace: false });
  gsap.set(sp.chars, { opacity: 0, yPercent: 38, color: QUENTE, textShadow: BRILHO });
  gsap.set(h1, { visibility: 'visible' });
  return gsap
    .timeline({
      paused: true,
      delay: 0.3,
      // o título continua dividido (desfazer a divisão mexeria no layout e contaria como CLS);
      // se a largura da tela mudar, as linhas são refeitas
      onComplete: () => {
        gsap.set(sp.chars, { clearProps: 'transform,color,textShadow,opacity' });
        h1.style.height = '';
        letrasH1 = sp.chars;
        let largura = window.innerWidth;
        window.addEventListener('resize', () => {
          if (window.innerWidth === largura) return;
          largura = window.innerWidth;
          sp.revert();
          sp.split();
          letrasH1 = sp.chars;
        });
      },
    })
    .to(sp.chars, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.024 }, 0)
    .to(sp.chars, { yPercent: 0, duration: 1.3, ease: ENTRA, stagger: 0.024 }, 0)
    .to(sp.chars, { color: '#ede4d6', textShadow: APAGADO, duration: 1.3, ease: 'power2.out', stagger: 0.024 }, 0.45);
}
function aberturaResto(entra, liberar) {
  // relógio: os dígitos giram uma volta inteira, como placa mecânica dando partida
  montarSlots(horaEl, '00:00');

  gsap
    .timeline({ defaults: { ease: ENTRA }, onComplete: liberar })
    .fromTo('.hero-poster img', { scale: 1.08, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
    .fromTo('.topo', { opacity: 0 }, { opacity: 1, duration: 1.2, clearProps: 'opacity' }, 0.3)
    .fromTo('.relogio', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.4 }, 0.5)
    .add(() => rolar(horaEl, CENAS[0].hora, { dur: 1.3, stagger: 0.09, voltas: 1, ease: 'power3.inOut', deTras: false }), 0.6)
    .fromTo('.linha-trilho', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0.8)
    .fromTo('.linha-rot', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.06 }, 1.1)
    .fromTo(entra, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.55);

  // ao rolar, o hero recua em camadas: vídeo afunda e escurece, brasas e texto sobem mais rápido
  const sombra = document.createElement('div');
  sombra.className = 'hero-sombra';
  $('.hero-midia').append(sombra);
  const tl = gsap
    .timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero-midia', { yPercent: 18, scale: 1.06, ease: 'none' }, 0)
    .to(sombra, { opacity: 0.62, ease: 'none' }, 0)
    .to('.relogio', { yPercent: -32, ease: 'none' }, 0)
    .to('.hero-texto', { y: () => -window.innerHeight * 0.09, ease: 'none' }, 0);

  // brasas: canvas leve, carregado quando o navegador folga
  quandoOcioso(async () => {
    const { criarParticulas } = await particulas();
    const c = canvasEm($('.hero'), 'hero-brasas');
    tl.to(c, { yPercent: -16, ease: 'none' }, 0);
    brasasHero = criarParticulas(c, { tipo: 'brasa', quantidade: celular() ? 34 : 80, dpr: celular() ? 1 : undefined });
    gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 2 });
    if (heroVisivel && !pausado) brasasHero.tocar();
    // a rolagem abana o fogo: as fagulhas sobem mais rápido
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (st) => brasasHero.sopro(-Math.min(Math.abs(st.getVelocity()) / 2600, 0.5)),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Topo: transparente no topo do hero, café-preto com desfoque depois  */
/* ------------------------------------------------------------------ */
function topo() {
  const el = $('#topo');
  let ultimo = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (st) => {
      const y = st.scroll();
      el.classList.toggle('cheio', y > 40);
      const descendo = y > ultimo;
      ultimo = y;
      el.classList.toggle('escondido', y > window.innerHeight && descendo && !el.contains(document.activeElement));
    },
  });
  $$('.topo-nav a').forEach((a) => {
    const alvo = $(a.getAttribute('href'));
    if (!alvo) return;
    ScrollTrigger.create({
      trigger: alvo,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (st) => a.setAttribute('aria-current', st.isActive ? 'true' : 'false'),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Títulos: letra a letra, chegam em brasa e esfriam (duas demãos)       */
/* ------------------------------------------------------------------ */
function titulos() {
  $$('[data-linhas]:not(.hero-h1), .nd-frase').forEach((t) => {
    const claro = !!t.closest('.dia, .tostado');
    SplitText.create(t, {
      type: 'lines,words,chars',
      mask: 'lines',
      linesClass: 'linha',
      aria: t.tagName === 'P' ? 'none' : 'auto',
      autoSplit: true,
      onSplit: (self) => {
        const cor = getComputedStyle(t).color;
        gsap.set(self.chars, claro ? { yPercent: 135, color: QUENTE_DIA } : { yPercent: 135, color: QUENTE, textShadow: BRILHO });
        return gsap
          .timeline({
            scrollTrigger: { trigger: t, start: 'top 88%', once: true },
            onComplete: () => gsap.set(self.chars, { clearProps: 'color,textShadow' }),
          })
          .to(self.chars, { yPercent: 0, duration: 1.15, ease: ENTRA, stagger: 0.02 }, 0)
          .to(self.chars, { color: cor, ...(claro ? {} : { textShadow: APAGADO }), duration: 1.2, ease: 'power2.out', stagger: 0.02 }, 0.4);
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Fotos: a porta do forno abre, sai um bafo de luz quente, e a foto     */
/* assenta; depois, parallax por dentro                                  */
/* ------------------------------------------------------------------ */
function fotos() {
  $$('[data-revela]').forEach((el) => {
    const pic = $('picture', el);
    const img = $('img', el);
    const calor = document.createElement('span');
    calor.className = 'calor';
    calor.setAttribute('aria-hidden', 'true');
    el.append(calor);
    gsap.set(img, { scale: 1.16 });
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
      .fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut', immediateRender: true }, 0)
      .fromTo(img, { scale: 1.42 }, { scale: 1.16, duration: 2, ease: ENTRA }, 0.15)
      .fromTo(calor, { yPercent: -55, opacity: 1 }, { yPercent: 45, duration: 1.7, ease: 'power2.inOut' }, 0)
      .to(calor, { opacity: 0, duration: 1, ease: 'power1.out' }, 0.9);
    gsap.fromTo(
      pic,
      { yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/* ------------------------------------------------------------------ */
/* Quadro: as plaquinhas de horário viram em cascata (flip mecânico)    */
/* ------------------------------------------------------------------ */
function quadro() {
  ScrollTrigger.create({
    trigger: lista,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      $$('.quadro-linha', lista).forEach((li, r) => {
        $$('.placa', li).forEach((pl, c) => {
          const final = pl.textContent;
          const giros = 3 + ((r + c) % 3);
          const t0 = r * 0.075 + c * 0.05;
          for (let k = 0; k < giros; k++) {
            const ultimo = k === giros - 1;
            tl.fromTo(
              pl,
              { rotationX: -95, transformPerspective: 220, transformOrigin: '50% 50%' },
              {
                rotationX: 0,
                duration: ultimo ? 0.42 : 0.085,
                ease: ultimo ? 'back.out(2.4)' : 'power1.out',
                immediateRender: k === 0,
                onStart: () => (pl.textContent = ultimo ? final : String((Number(final) + k * 3 + r + 1) % 10)),
              },
              t0 + k * 0.085,
            );
          }
        });
      });
      tl.from($$('.quadro-nome, .quadro-estado, .quadro-acao', lista), { opacity: 0, x: -14, duration: 0.8, stagger: 0.03, ease: ENTRA }, 0.2)
        .fromTo($$('.quadro-agora', lista), { '--agora': 0 }, { '--agora': 1, duration: 1.4, ease: 'power3.inOut' }, 0.5)
        .from($$('.quadro-agora span', lista), { opacity: 0, x: -10, duration: 0.7, ease: ENTRA }, 0.6)
        .from($$('.quadro-linha .estado-marca', lista), { scale: 0, duration: 0.6, stagger: 0.04, ease: MECANICA }, 0.6);
    },
  });
  // legenda e dia: entram como o resto do painel
  gsap.from('.fornadas-cabeca .quadro-dia, .fornadas-cabeca .legenda .estado', {
    opacity: 0,
    y: 14,
    duration: 0.9,
    stagger: 0.08,
    ease: ENTRA,
    scrollTrigger: { trigger: '.fornadas-cabeca .quadro-dia', start: 'top 90%', once: true },
  });
}

/* ------------------------------------------------------------------ */
/* Faixa de ingredientes: marquee que acelera, inclina e acende         */
/* ------------------------------------------------------------------ */
function faixa() {
  const trilho = $('[data-faixa]');
  trilho.innerHTML += trilho.innerHTML;
  const loop = gsap.to(trilho, { xPercent: -50, duration: 46, ease: 'none', repeat: -1, paused: true });
  const inclina = gsap.quickTo(trilho, 'skewX', { duration: 0.6, ease: 'power3.out' });
  const pontos = $$('b', trilho);
  let parar = 0;
  ScrollTrigger.create({
    trigger: '.faixa',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (st) => (st.isActive ? loop.play() : loop.pause()),
    onUpdate: (st) => {
      const v = st.getVelocity();
      const sentido = v < 0 ? -1 : 1;
      gsap.to(loop, { timeScale: sentido * (1 + Math.min(Math.abs(v) / 500, 4)), duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: sentido, duration: 1.4, delay: 0.3 });
      inclina(gsap.utils.clamp(-9, 9, -v / 260));
      gsap.to(pontos, { scale: 1 + Math.min(Math.abs(v) / 1400, 1.3), duration: 0.25, overwrite: true });
      clearTimeout(parar);
      parar = setTimeout(() => {
        inclina(0);
        gsap.to(pontos, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      }, 140);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Processo: 36 horas num eixo horizontal com profundidade; o fundo     */
/* amanhece com uma varredura de luz; a massa cresce; a farinha cai     */
/* ------------------------------------------------------------------ */
const NOITE = { '--fundo': '#14100d', '--tinta': '#ede4d6', '--suave': '#b9a893' };
const AURORA = { '--fundo': '#4a2c1a', '--tinta': '#ede4d6', '--suave': '#e0c6a8' };
const DIA = { '--fundo': '#ede4d6', '--tinta': '#14100d', '--suave': '#5a4636' };
function processo(mm) {
  const secao = $('.processo');
  const pino = $('[data-processo]');
  const trilho = $('[data-processo-trilho]');
  const cabeca = $('.processo-cabeca');
  const horaEl = $('[data-processo-hora]');
  const barra = $('[data-processo-progresso]');
  const linha = $('.processo-linha');
  const etapas = $$('.etapa', trilho);
  const horas = etapas.map((e) => Number(e.dataset.hora));

  const luz = document.createElement('div');
  luz.className = 'processo-luz';
  luz.setAttribute('aria-hidden', 'true');
  pino.append(luz);
  let farinha = null;
  const iniciarFarinha = (qtd) =>
    quandoOcioso(async () => {
      const { criarParticulas } = await particulas();
      if (farinha) return;
      const c = canvasEm(pino, 'processo-farinha');
      farinha = criarParticulas(c, { tipo: 'farinha', quantidade: qtd, dpr: celular() ? 1 : undefined });
      farinha.amanhecer(estado.dia);
      ScrollTrigger.create({
        trigger: secao,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (st) => (st.isActive ? farinha.tocar() : farinha.pausar()),
      });
      if (ScrollTrigger.isInViewport(secao)) farinha.tocar();
    });

  // conta de 0 até a hora da etapa
  const contar = (etapa) => {
    const t = $('time', etapa);
    const alvo = Number(etapa.dataset.hora);
    const o = { v: Math.max(0, alvo - 8) };
    return gsap.to(o, { v: alvo, duration: 1.3, ease: 'power2.out', onUpdate: () => (t.textContent = `${Math.round(o.v)}h`) });
  };

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const distancia = () => Math.max(0, trilho.scrollWidth - (pino.clientWidth - cabeca.offsetWidth));
    gsap.set(secao, NOITE);
    const brasa = document.createElement('i');
    brasa.className = 'processo-brasa';
    linha.append(brasa);
    // madrugada → aurora (ainda escura, texto claro) → dia (troca rápida, sem meio-termo cinzento)
    const amanhecer = gsap
      .timeline({ paused: true })
      .to(secao, { ...AURORA, duration: 0.7, ease: 'none' })
      .to(secao, { ...DIA, duration: 0.3, ease: 'power1.inOut' })
      .fromTo(luz, { xPercent: -110, opacity: 0 }, { xPercent: 110, duration: 1, ease: 'power1.inOut' }, 0)
      .to(luz, { keyframes: { opacity: [0, 1, 1, 0] }, duration: 1, ease: 'none' }, 0)
      .to(estado, { dia: 1, duration: 0.3, ease: 'none', onUpdate: () => farinha?.amanhecer(estado.dia) }, 0.7);
    let xAntes = 0;
    const viagem = gsap.to(trilho, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: pino,
        start: 'top top',
        end: () => '+=' + distancia() * 1.1,
        pin: true,
        scrub: 0.9,
        invalidateOnRefresh: true,
        onUpdate: (st) => {
          const f = st.progress * (horas.length - 1);
          const i = Math.min(horas.length - 2, Math.floor(f));
          horaEl.textContent = Math.round(horas[i] + (horas[i + 1] - horas[i]) * (f - i));
          barra.style.transform = `scaleX(${st.progress})`;
          brasa.style.transform = `translateX(${st.progress * linha.offsetWidth}px)`;
          amanhecer.progress(gsap.utils.clamp(0, 1, (st.progress - 0.3) / 0.62));
          // a farinha é a camada da frente: corre mais que o trilho
          const x = st.progress * distancia();
          farinha?.empurrar(-(x - xAntes) * 0.08, 0);
          xAntes = x;
        },
      },
    });
    etapas.forEach((etapa) => {
      const foto = $('.etapa-foto', etapa);
      const img = $('img', etapa);
      const texto = $('.etapa-texto', etapa);
      gsap.set(img, { scale: 1.15 });
      gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: etapa, containerAnimation: viagem, start: 'left right', end: 'right left', scrub: true } });
      // a massa cresce ao chegar no meio da tela
      gsap.fromTo(
        foto,
        { scale: 0.8, transformOrigin: '50% 100%' },
        { scale: 1, ease: 'power1.out', scrollTrigger: { trigger: etapa, containerAnimation: viagem, start: 'left right', end: 'center 55%', scrub: true } },
      );
      // texto numa camada mais lenta que a foto: profundidade
      gsap.fromTo(texto, { x: 90 }, { x: -60, ease: 'none', scrollTrigger: { trigger: etapa, containerAnimation: viagem, start: 'left right', end: 'right left', scrub: true } });
      // as etapas que já estão na tela quando o pino começa entram com a seção; as outras, com o trilho
      const jaVisivel = etapa.getBoundingClientRect().left - pino.getBoundingClientRect().left < window.innerWidth * 0.88;
      const gatilho = jaVisivel
        ? { trigger: pino, start: 'top 55%' }
        : { trigger: etapa, containerAnimation: viagem, start: 'left 88%' };
      gsap.from(texto.children, {
        autoAlpha: 0,
        y: 36,
        duration: 1.1,
        stagger: 0.08,
        ease: ENTRA,
        scrollTrigger: { ...gatilho, toggleActions: 'play none none reverse' },
      });
      ScrollTrigger.create({ ...gatilho, once: true, onEnter: () => contar(etapa) });
    });
    iniciarFarinha(70);
    return () => {
      gsap.set(secao, { clearProps: '--fundo,--tinta,--suave' });
      brasa.remove();
    };
  });

  // celular/tablet: sem pino, mas o fundo também amanhece enquanto a seção passa
  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    gsap
      .timeline({ scrollTrigger: { trigger: secao, start: '40% 75%', end: '85% 60%', scrub: true } })
      .fromTo(secao, NOITE, { ...AURORA, duration: 0.7, ease: 'none' })
      .to(secao, { ...DIA, duration: 0.3, ease: 'power1.inOut' })
      .fromTo(luz, { xPercent: -110, opacity: 0 }, { xPercent: 110, duration: 1, ease: 'power1.inOut' }, 0)
      .to(luz, { keyframes: { opacity: [0, 1, 1, 0] }, duration: 1, ease: 'none' }, 0)
      .to(estado, { dia: 1, duration: 0.3, ease: 'none', onUpdate: () => farinha?.amanhecer(estado.dia) }, 0.7);
    let yAntes = null;
    ScrollTrigger.create({
      trigger: secao,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (st) => {
        const y = st.scroll();
        if (yAntes !== null) farinha?.empurrar(0, -(y - yAntes) * 0.12);
        yAntes = y;
      },
    });
    etapas.forEach((etapa) => {
      const foto = $('.etapa-foto', etapa);
      gsap
        .timeline({ scrollTrigger: { trigger: etapa, start: 'top 85%', once: true } })
        .from(foto, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'power4.inOut' }, 0)
        .from($$('.etapa-texto > *', etapa), { opacity: 0, y: 24, duration: 1, stagger: 0.08, ease: ENTRA }, 0.35)
        .add(() => contar(etapa), 0.3);
      // a massa cresce enquanto sobe na tela
      gsap.fromTo(
        $('img', etapa),
        { scale: 0.88, transformOrigin: '50% 100%' },
        { scale: 1.04, ease: 'none', scrollTrigger: { trigger: etapa, start: 'top bottom', end: 'center 40%', scrub: true } },
      );
    });
    iniciarFarinha(26);
  });
}

/* ------------------------------------------------------------------ */
/* Do Nordeste: vapor do café e o número que rola                       */
/* ------------------------------------------------------------------ */
function nordeste() {
  const fios = $$('.vapor path');
  const vapor = gsap.timeline({ repeat: -1, paused: true });
  fios.forEach((p, i) => {
    vapor.fromTo(
      p,
      { y: 40, opacity: 0, scaleY: 0.85 },
      { y: -50, opacity: 0.85, scaleY: 1.1, duration: 2.6, ease: 'sine.out', transformOrigin: '50% 100%' },
      i * 1.1,
    );
    vapor.to(p, { opacity: 0, duration: 1.2, ease: 'sine.in' }, i * 1.1 + 2.1);
  });
  ScrollTrigger.create({
    trigger: '.nd-cafe',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (st) => (st.isActive ? vapor.play() : vapor.pause()),
  });
  gsap.from('.nd-numero > p:not(.nd-frase)', {
    opacity: 0,
    y: 16,
    duration: 1,
    ease: ENTRA,
    scrollTrigger: { trigger: '.nd-numero', start: 'top 80%', once: true },
  });
  $$('.nd figcaption').forEach((f) =>
    gsap.from(f.children, { opacity: 0, y: 18, duration: 1, stagger: 0.1, ease: ENTRA, scrollTrigger: { trigger: f, start: 'top 92%', once: true } }),
  );
}

/* ------------------------------------------------------------------ */
/* Cardápio: abas acessíveis, porta de enrolar na troca de foto,        */
/* pontilhados que se desenham e preços que rolam                       */
/* ------------------------------------------------------------------ */
function cardapio() {
  const abasEl = $('.abas');
  const abas = $$('.abas [role="tab"]');
  const traco = $('.abas-traco');
  const moldura = $('.cardapio-foto');
  const picture = $('picture', moldura);
  let fotoAtual = 'casca';
  let troca = null;
  let porta = null;
  if (!semMovimento()) {
    porta = document.createElement('div');
    porta.className = 'porta-forno';
    porta.setAttribute('aria-hidden', 'true');
    moldura.append(porta);
  }

  const srcset = (nome, ext) => [480, 800, 1200, 1600, 2400].map((w) => `/img/${nome}-${w}.${ext} ${w}w`).join(', ');
  const aplicar = (nome) => {
    $('source[type="image/avif"]', picture).srcset = srcset(nome, 'avif');
    $('source[type="image/webp"]', picture).srcset = srcset(nome, 'webp');
    $('img', picture).src = `/img/${nome}-1200.webp`;
  };
  const preCarregar = (nome) => {
    const i = new Image();
    i.src = `/img/${nome}-800.webp`;
  };
  function trocarFoto(nome) {
    if (!nome || nome === fotoAtual) return;
    fotoAtual = nome;
    if (semMovimento()) return aplicar(nome);
    if (troca) troca.kill();
    const img = $('img', picture);
    // a porta de enrolar desce, troca a foto e sobe de novo
    troca = gsap
      .timeline()
      .to(porta, { yPercent: 0, duration: 0.28, ease: 'power3.in' })
      .add(() => {
        aplicar(nome);
        const tl = troca;
        tl.pause();
        Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 450))]).then(() => tl.resume());
      })
      .fromTo(img, { scale: 1.1 }, { scale: 1, duration: 1, ease: ENTRA })
      .to(porta, { yPercent: -101, duration: 0.6, ease: 'power3.out' }, '<');
  }
  function moverTraco(aba) {
    traco.style.width = aba.offsetWidth + 'px';
    traco.style.transform = `translate(${aba.offsetLeft}px, ${aba.offsetTop + aba.offsetHeight - 1}px)`;
  }
  const precos = (painel) => $$('.item-preco', painel);
  const rolarPrecos = (painel, atraso = 0) =>
    precos(painel).forEach((p, i) => {
      const final = p.dataset.preco || (p.dataset.preco = p.textContent.trim());
      gsap.delayedCall(atraso + i * 0.07, () => rolar(p, final, { de: final.replace(/\d/g, '0'), dur: 0.7, stagger: 0.05, limpar: true }));
    });
  function selecionar(aba, focar = false, registrar = true) {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute('aria-selected', String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      $('#' + a.getAttribute('aria-controls')).hidden = !ativa;
    });
    moverTraco(aba);
    if (focar) aba.focus();
    if (registrar) {
      const u = new URL(location.href);
      u.searchParams.set('cardapio', aba.id.replace('aba-', ''));
      history.replaceState(null, '', u);
    }
    const painel = $('#' + aba.getAttribute('aria-controls'));
    const lis = $$('li[data-foto]', painel);
    lis.forEach((li) => preCarregar(li.dataset.foto));
    $$('li.ativo').forEach((li) => li.classList.remove('ativo'));
    if (lis[0]) {
      lis[0].classList.add('ativo');
      trocarFoto(lis[0].dataset.foto);
    }
    if (!semMovimento()) {
      gsap.fromTo(lis, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: ENTRA, overwrite: true });
      gsap.fromTo($$('.item-pontos', painel), { scaleX: 0 }, { scaleX: 1, duration: 1, stagger: 0.05, ease: 'power3.inOut', delay: 0.1 });
      rolarPrecos(painel, 0.15);
    }
  }
  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => selecionar(aba));
    aba.addEventListener('keydown', (e) => {
      const mapa = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      selecionar(abas[(mapa[e.key] + abas.length) % abas.length], true);
    });
  });
  $$('.itens li[data-foto]').forEach((li) => {
    const ativar = () => {
      $$('li.ativo').forEach((x) => x.classList.remove('ativo'));
      li.classList.add('ativo');
      trocarFoto(li.dataset.foto);
    };
    li.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      ativar();
      // o preço dá uma volta, como a máquina registradora
      const p = $('.item-preco', li);
      if (!semMovimento() && !p._rolo) {
        const final = p.dataset.preco || (p.dataset.preco = p.textContent.trim());
        rolar(p, final, { de: final, voltas: 1, dur: 0.55, stagger: 0.05, ease: 'power3.inOut', limpar: true });
      }
    });
    li.addEventListener('click', ativar);
  });
  const pedida = new URLSearchParams(location.search).get('cardapio');
  const inicial = (pedida && $('#aba-' + pedida)) || abas[0];
  if (inicial !== abas[0]) selecionar(inicial, false, false);
  else {
    $('#painel-paes li[data-foto]').classList.add('ativo');
    moverTraco(abas[0]);
  }
  const reposicionar = () => moverTraco(abas.find((a) => a.getAttribute('aria-selected') === 'true'));
  window.addEventListener('resize', reposicionar);
  document.fonts?.ready.then(reposicionar);

  if (!semMovimento()) {
    const painel = $('.painel:not([hidden])');
    gsap.set($$('li', painel), { opacity: 0, y: 16 });
    gsap.set($$('.item-pontos', painel), { scaleX: 0 });
    gsap.set(porta, { yPercent: 0 });
    ScrollTrigger.create({
      trigger: '.cardapio',
      start: 'top 62%',
      once: true,
      onEnter: () => {
        gsap
          .timeline()
          .from(traco, { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }, 0)
          .from(abas, { opacity: 0, y: 10, duration: 0.8, stagger: 0.06, ease: ENTRA }, 0)
          .to($$('li', painel), { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: ENTRA }, 0.1)
          .to($$('.item-pontos', painel), { scaleX: 1, duration: 1.1, stagger: 0.06, ease: 'power3.inOut' }, 0.25)
          .add(() => rolarPrecos(painel), 0.3);
      },
    });
    // a porta de enrolar sobe e a foto aparece assentando
    gsap
      .timeline({ scrollTrigger: { trigger: '.cardapio', start: 'top 70%', once: true } })
      .to(porta, { yPercent: -101, duration: 1.3, ease: 'power3.inOut' }, 0)
      .fromTo($('img', picture), { scale: 1.2 }, { scale: 1, duration: 1.8, ease: ENTRA }, 0.2);
  }
}

/* ------------------------------------------------------------------ */
/* Depoimentos                                                          */
/* ------------------------------------------------------------------ */
function citacoes() {
  const caixas = $$('[data-citacao]');
  const atual = $('[data-atual]');
  let i = 0;
  let animando = false;
  function ir(n) {
    if (animando) return;
    const prox = (n + caixas.length) % caixas.length;
    if (prox === i) return;
    const de = caixas[i];
    const para = caixas[prox];
    const sobe = n > i;
    i = prox;
    if (semMovimento()) {
      atual.textContent = i + 1;
      de.hidden = true;
      para.hidden = false;
      return;
    }
    animando = true;
    gsap
      .timeline()
      .to(atual, { yPercent: sobe ? -100 : 100, opacity: 0, duration: 0.22, ease: 'power2.in' })
      .add(() => (atual.textContent = i + 1))
      .fromTo(atual, { yPercent: sobe ? 100 : -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: MECANICA });
    gsap.to(de, {
      opacity: 0,
      y: -14,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        de.hidden = true;
        gsap.set(de, { clearProps: 'all' });
        para.hidden = false;
        const sp = SplitText.create($('blockquote p', para), { type: 'lines', mask: 'lines', aria: 'none' });
        gsap
          .timeline({
            onComplete: () => {
              sp.revert();
              animando = false;
            },
          })
          .from(sp.lines, { yPercent: 108, duration: 1.1, stagger: 0.09, ease: ENTRA })
          .from($('figcaption', para), { opacity: 0, y: 8, duration: 0.7 }, 0.35);
      },
    });
  }
  $('[data-anterior]').addEventListener('click', () => ir(i - 1));
  $('[data-proximo]').addEventListener('click', () => ir(i + 1));
  let x0 = null;
  const area = $('[data-citacoes]');
  area.addEventListener('pointerdown', (e) => (x0 = e.pointerType === 'mouse' ? null : e.clientX));
  area.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) ir(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  if (!semMovimento()) {
    const sp = SplitText.create($('blockquote p', caixas[0]), { type: 'lines', mask: 'lines', aria: 'none' });
    gsap.from(sp.lines, {
      yPercent: 108,
      duration: 1.2,
      stagger: 0.1,
      ease: ENTRA,
      scrollTrigger: { trigger: '.vizinhos', start: 'top 70%', once: true },
      onComplete: () => sp.revert(),
    });
  }
}

/* ------------------------------------------------------------------ */
/* Visite e rodapé                                                      */
/* ------------------------------------------------------------------ */
function visiteERodape() {
  // horários: linhas em cascata e o fio de hoje acende
  gsap
    .timeline({ scrollTrigger: { trigger: '.horarios', start: 'top 82%', once: true } })
    .from('.horarios > div', { opacity: 0, y: 14, duration: 0.9, stagger: 0.08, ease: ENTRA }, 0)
    .fromTo('.horarios > div.hoje', { '--fio': 0 }, { '--fio': 1, duration: 1.2, ease: 'power3.inOut' }, 0.4);
  gsap.from('.status-loja', { opacity: 0, x: -12, duration: 0.9, ease: ENTRA, scrollTrigger: { trigger: '.status-loja', start: 'top 88%', once: true } });
  // a placa do endereço é pendurada e balança até parar (mola)
  gsap
    .timeline({ scrollTrigger: { trigger: '.endereco', start: 'top 88%', once: true } })
    .from('.endereco-rua', { y: -26, opacity: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .fromTo('.endereco-rua', { rotation: -9, transformOrigin: '50% -60%' }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1.1, 0.28)' }, 0.1)
    .from('.endereco > span:not(.endereco-rua)', { opacity: 0, y: 10, duration: 0.8, stagger: 0.08, ease: ENTRA }, 0.4);

  // rodapé: o "Sereno" sobe e acende como brasa (frio → brasa → papel), com um bafo de luz atrás
  const letreiro = $('[data-rodape-letreiro]');
  const brilho = document.createElement('span');
  brilho.className = 'rodape-brilho';
  brilho.setAttribute('aria-hidden', 'true');
  brilho.innerHTML = '<span>Sereno</span>';
  letreiro.before(brilho);
  const letras = SplitText.create(letreiro, { type: 'chars', mask: 'chars', aria: 'none' }).chars;
  gsap.set(letras, { color: '#3a2a20' });
  // entra assim que o rodapé aparece (não fica preso à rolagem até o fim da página)
  gsap
    .timeline({ scrollTrigger: { trigger: '.rodape-letreiro', start: 'top 82%', once: true } })
    .from(letras, { yPercent: 105, duration: 1.3, stagger: 0.075, ease: ENTRA }, 0)
    .to(
      letras,
      { keyframes: { color: ['#3a2a20', '#e0773f', '#ffc79a', '#ede4d6'], easeEach: 'none' }, duration: 2.2, stagger: 0.075, ease: 'power1.inOut' },
      0.1,
    )
    .fromTo(brilho, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.5);
  // depois de acesa, a brasa respira
  const respira = gsap.to($('span', brilho), { opacity: 0.45, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
  ScrollTrigger.create({ trigger: '.rodape', start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? respira.play() : respira.pause()) });
}

/* ------------------------------------------------------------------ */
/* Botões principais: magnéticos, com reflexo que segue o cursor        */
/* ------------------------------------------------------------------ */
function botoesMagneticos() {
  if (!ponteiroFino.matches) return;
  $$('.btn-grande').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    let r = null;
    el.addEventListener('pointerenter', () => (r = el.getBoundingClientRect()));
    el.addEventListener('pointermove', (e) => {
      if (!r) return;
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      x((fx - 0.5) * 16);
      y((fy - 0.5) * 12);
      el.style.setProperty('--mx', `${(fx * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(fy * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Lamparina: uma luz quente segue o cursor nas seções escuras          */
/* ------------------------------------------------------------------ */
function lamparina() {
  if (!ponteiroFino.matches) return;
  const luz = document.createElement('div');
  luz.className = 'lamparina';
  luz.setAttribute('aria-hidden', 'true');
  document.body.append(luz);
  const xTo = gsap.quickTo(luz, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(luz, 'y', { duration: 0.7, ease: 'power3.out' });
  const aTo = gsap.quickTo(luz, 'opacity', { duration: 0.6, ease: 'power2.out' });
  let faixas = [];
  const medir = () => {
    faixas = $$('.hero, .fornadas, .faixa, .processo, .rodape').map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + scrollY, r.bottom + scrollY, el.classList.contains('processo')];
    });
  };
  ScrollTrigger.addEventListener('refresh', medir);
  medir();
  let cy = -1;
  let dentro = false;
  const avaliar = () => {
    if (!dentro) return aTo(0);
    const y = cy + scrollY;
    let f = 0;
    for (const [t, b, proc] of faixas) {
      if (y >= t && y < b) {
        f = proc ? 1 - estado.dia : 1;
        break;
      }
    }
    aTo(f);
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      cy = e.clientY;
      dentro = true;
      xTo(e.clientX);
      yTo(e.clientY);
      avaliar();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    dentro = false;
    aTo(0);
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: avaliar });
}

/* ------------------------------------------------------------------ */
async function iniciar() {
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]);
  document.documentElement.classList.add('pronto');
  iniciarLenis();
  const mm = gsap.matchMedia();

  // ordem da página: o pino do processo nasce antes de tudo que fica abaixo dele
  abertura();
  if (!semMovimento()) quadro();
  processo(mm);
  topo();
  cardapio();
  citacoes();
  if (!semMovimento()) {
    titulos();
    faixa();
    fotos();
    nordeste();
    visiteERodape();
    botoesMagneticos();
    lamparina();
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
iniciar();
