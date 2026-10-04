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

/* Assinatura de movimento (direção B): tudo desacelera devagar, como luz chegando.
   Entradas: expo.out 1,1–1,4 s. Trocas: power2.inOut. Nada pula, nada quica. */
const ENTRA = 'expo.out';
const TROCA = 'power2.inOut';

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
  if (pausado) video.pause();
  else tocar();
});
atualizarPausa();
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (st) => (st.isActive ? tocar() : video.pause()),
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
  if (horaEl.textContent === c.hora && legendaEl.textContent === c.texto) {
    marcaEl.style.setProperty('--pos', c.pos);
    return;
  }
  marcaEl.style.setProperty('--pos', c.pos);
  if (semMovimento()) {
    horaEl.textContent = c.hora;
    legendaEl.textContent = c.texto;
    return;
  }
  const tl = gsap.timeline();
  tl.to([horaEl, legendaEl], { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power2.in', stagger: 0.06 })
    .add(() => {
      horaEl.textContent = c.hora;
      legendaEl.textContent = c.texto;
    })
    .fromTo([horaEl, legendaEl], { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: ENTRA, stagger: 0.08 });
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
    liberar();
    return;
  }
  // autoSplit: se a fonte chegar depois ou a tela mudar, as linhas são refeitas sem quebrar o título
  SplitText.create('.hero-h1', {
    type: 'lines',
    mask: 'lines',
    aria: 'none',
    autoSplit: true,
    reduceWhiteSpace: false,
    onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 1.3, stagger: 0.11, ease: ENTRA, delay: 0.35 }),
  });
  gsap
    .timeline({ defaults: { ease: ENTRA }, onComplete: liberar })
    .fromTo('.hero-poster img', { scale: 1.08, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' }, 0)
    .fromTo('.topo', { opacity: 0 }, { opacity: 1, duration: 1.2, clearProps: 'opacity' }, 0.3)
    .fromTo(entra, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.85)
    .fromTo('.relogio', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.4 }, 0.6);

  // ao rolar, a câmera se afasta e o texto sobe um pouco mais rápido que o fundo
  gsap.to('.hero-midia', {
    yPercent: 18,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
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
/* Títulos: linha a linha atrás de uma máscara                          */
/* ------------------------------------------------------------------ */
function titulos() {
  $$('[data-linhas]:not(.hero-h1)').forEach((t) => {
    SplitText.create(t, {
      type: 'lines',
      mask: 'lines',
      aria: 'none',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.2,
          stagger: 0.1,
          ease: ENTRA,
          scrollTrigger: { trigger: t, start: 'top 88%', once: true },
        }),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Fotos: abrem como janela (clip-path) e assentam (scale)              */
/* ------------------------------------------------------------------ */
function fotos() {
  $$('[data-revela]').forEach((el) => {
    const img = $('img', el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 35%', scrub: 0.8 } })
      .fromTo(el, { clipPath: 'inset(9% 7% 9% 7%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
      .fromTo(img, { scale: 1.18 }, { scale: 1.02, ease: 'none' }, 0);
  });
}

/* ------------------------------------------------------------------ */
/* Quadro: linhas entram em cascata e os horários rolam               */
/* ------------------------------------------------------------------ */
function quadro() {
  ScrollTrigger.create({
    trigger: lista,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap
        .timeline()
        .from($$('.hora-txt', lista), { yPercent: 105, duration: 1, stagger: 0.05, ease: ENTRA }, 0)
        .from($$('.quadro-nome, .quadro-estado, .quadro-acao', lista), { opacity: 0, y: 10, duration: 0.9, stagger: 0.03, ease: ENTRA }, 0.1)
        .from($$('.quadro-agora', lista), { opacity: 0, duration: 0.6 }, 0.5);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Faixa de ingredientes: único marquee, responde à velocidade         */
/* ------------------------------------------------------------------ */
function faixa() {
  const trilho = $('[data-faixa]');
  trilho.innerHTML += trilho.innerHTML;
  const loop = gsap.to(trilho, { xPercent: -50, duration: 46, ease: 'none', repeat: -1, paused: true });
  ScrollTrigger.create({
    trigger: '.faixa',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (st) => (st.isActive ? loop.play() : loop.pause()),
    onUpdate: (st) => {
      const v = st.getVelocity();
      const sentido = v < 0 ? -1 : 1;
      gsap.to(loop, { timeScale: sentido * (1 + Math.min(Math.abs(v) / 700, 3)), duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: sentido, duration: 1.4, delay: 0.3 });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Processo: 36 horas num eixo horizontal; o fundo amanhece             */
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
  const etapas = $$('.etapa', trilho);
  const horas = etapas.map((e) => Number(e.dataset.hora));

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const distancia = () => Math.max(0, trilho.scrollWidth - (pino.clientWidth - cabeca.offsetWidth));
    gsap.set(secao, NOITE);
    // madrugada → aurora (ainda escura, texto claro) → dia (troca rápida, sem meio-termo cinzento)
    const amanhecer = gsap
      .timeline({ paused: true })
      .to(secao, { ...AURORA, duration: 0.7, ease: 'none' })
      .to(secao, { ...DIA, duration: 0.3, ease: 'power1.inOut' });
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
          amanhecer.progress(gsap.utils.clamp(0, 1, (st.progress - 0.3) / 0.62));
        },
      },
    });
    etapas.forEach((etapa) => {
      const img = $('img', etapa);
      gsap.set(img, { scale: 1.15 });
      gsap.fromTo(
        img,
        { xPercent: -5 },
        { xPercent: 5, ease: 'none', scrollTrigger: { trigger: etapa, containerAnimation: viagem, start: 'left right', end: 'right left', scrub: true } },
      );
      gsap.from($('.etapa-texto', etapa), {
        autoAlpha: 0,
        y: 36,
        duration: 1.1,
        ease: ENTRA,
        scrollTrigger: { trigger: etapa, containerAnimation: viagem, start: 'left 92%', toggleActions: 'play none none reverse' },
      });
    });
    return () => gsap.set(secao, { clearProps: '--fundo,--tinta,--suave' });
  });

  // celular/tablet: sem pino, mas o fundo também amanhece enquanto a seção passa
  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    gsap
      .timeline({ scrollTrigger: { trigger: secao, start: '40% 75%', end: '85% 60%', scrub: true } })
      .fromTo(secao, NOITE, { ...AURORA, duration: 0.7, ease: 'none' })
      .to(secao, { ...DIA, duration: 0.3, ease: 'power1.inOut' });
    etapas.forEach((etapa) => {
      gsap.from($('.etapa-foto', etapa), {
        clipPath: 'inset(10% 8% 10% 8%)',
        duration: 1.3,
        ease: ENTRA,
        scrollTrigger: { trigger: etapa, start: 'top 85%', once: true },
      });
      const t = $('time', etapa);
      const alvo = Number(etapa.dataset.hora);
      const o = { v: Math.max(0, alvo - 6) };
      gsap.to(o, {
        v: alvo,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => (t.textContent = `${Math.round(o.v)}h`),
        scrollTrigger: { trigger: etapa, start: 'top 78%', once: true },
      });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Do Nordeste: contador e vapor do café                                */
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
}

/* ------------------------------------------------------------------ */
/* Cardápio: abas acessíveis, traço que desliza, foto em fusão          */
/* ------------------------------------------------------------------ */
function cardapio() {
  const abas = $$('.abas [role="tab"]');
  const traco = $('.abas-traco');
  const picture = $('.cardapio-foto picture');
  let fotoAtual = 'casca';
  let troca = null;

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
    troca = gsap
      .timeline()
      .to(img, { opacity: 0, duration: 0.22, ease: 'power1.in' })
      .add(() => aplicar(nome))
      .fromTo(img, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.7, ease: ENTRA });
  }
  function moverTraco(aba) {
    traco.style.width = aba.offsetWidth + 'px';
    traco.style.transform = `translateX(${aba.offsetLeft}px)`;
  }
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
      gsap.fromTo($$('.item-pontos', painel), { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.05, ease: ENTRA, delay: 0.1 });
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
    li.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && ativar());
    li.addEventListener('click', ativar);
  });
  const pedida = new URLSearchParams(location.search).get('cardapio');
  const inicial = (pedida && $('#aba-' + pedida)) || abas[0];
  if (inicial !== abas[0]) selecionar(inicial, false, false);
  else {
    $('#painel-paes li[data-foto]').classList.add('ativo');
    moverTraco(abas[0]);
  }
  window.addEventListener('resize', () => moverTraco(abas.find((a) => a.getAttribute('aria-selected') === 'true')));

  if (!semMovimento()) {
    gsap.from($$('#painel-paes li'), {
      opacity: 0,
      y: 16,
      duration: 0.9,
      stagger: 0.06,
      ease: ENTRA,
      scrollTrigger: { trigger: '.cardapio-lista', start: 'top 70%', once: true },
    });
    gsap.fromTo(
      '.cardapio-foto',
      { clipPath: 'inset(8% 8% 8% 8%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.cardapio', start: 'top 85%', end: 'top 25%', scrub: 0.8 } },
    );
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
    i = prox;
    atual.textContent = i + 1;
    if (semMovimento()) {
      de.hidden = true;
      para.hidden = false;
      return;
    }
    animando = true;
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
  const letras = SplitText.create('[data-rodape-letreiro]', { type: 'chars', mask: 'chars', aria: 'none' }).chars;
  gsap.from(letras, {
    yPercent: 100,
    stagger: 0.06,
    ease: 'none',
    scrollTrigger: { trigger: '.rodape', start: 'top 85%', end: 'bottom bottom', scrub: 0.8 },
  });
}

/* ------------------------------------------------------------------ */
/* Botões principais seguem de leve o cursor (só mouse)                 */
/* ------------------------------------------------------------------ */
function botoesMagneticos() {
  if (!ponteiroFino.matches) return;
  $$('.btn-grande').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    let r = null;
    el.addEventListener('pointerenter', () => (r = el.getBoundingClientRect()));
    el.addEventListener('pointermove', (e) => {
      if (!r) return;
      x(((e.clientX - r.left) / r.width - 0.5) * 8);
      y(((e.clientY - r.top) / r.height - 0.5) * 6);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
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
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
iniciar();
