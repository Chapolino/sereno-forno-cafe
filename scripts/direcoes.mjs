// Gera as 3 direções de arte (style tile + mockup estático da hero, desktop e celular) em docs/direcoes/.
// Uso: node scripts/direcoes.mjs   → docs/direcoes/<id>-hero.png, <id>-hero-celular.png, <id>-tile.png e index.html
import { writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const IMG = (n, w = 1600) => `../../public/img/${n}-${w}.webp`;
const FONTES = `
@font-face{font-family:Caslon;src:url(fontes/libre-caslon-display-latin.woff2) format('woff2')}
@font-face{font-family:Instrument;src:url(fontes/instrument-serif-latin.woff2) format('woff2')}
@font-face{font-family:Instrument;font-style:italic;src:url(fontes/instrument-serif-latin-italic.woff2) format('woff2')}
@font-face{font-family:Figtree;src:url(fontes/figtree-latin-wght.woff2) format('woff2');font-weight:300 900}`;
const BASE = `*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{-webkit-font-smoothing:antialiased;font-family:Figtree,system-ui,sans-serif}
img{display:block;max-width:100%}a{color:inherit;text-decoration:none}
.grao::after{content:"";position:fixed;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:multiply;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`;

// Linha do tempo da madrugada (vitrine): 3h a 7h, marcador no horário
const linha = (cor, marca, hora = 0.17) => `<div class="tl" style="--c:${cor};--m:${marca}"><span class="tl-trilho"></span><span class="tl-marca" style="left:${hora * 100}%"></span>
<span class="tl-r" style="left:0">3h</span><span class="tl-r" style="left:25%">4h</span><span class="tl-r" style="left:50%">5h</span><span class="tl-r" style="left:75%">6h</span><span class="tl-r" style="left:100%">7h</span></div>`;
const TL_CSS = `.tl{position:relative;height:34px;width:100%;max-width:300px}.tl-trilho{position:absolute;left:0;right:0;top:8px;height:1px;background:var(--c);opacity:.6}
.tl-marca{position:absolute;top:3px;width:11px;height:11px;margin-left:-5px;border-radius:50%;background:var(--m)}
.tl-r{position:absolute;top:18px;font-size:11px;letter-spacing:.02em;color:var(--c);opacity:.85;transform:translateX(-50%)}`;

const DIRECOES = [
  {
    id: 'A-papel-e-forno',
    nome: 'A · Papel e Forno',
    tese: 'Editorial claro e quente, como uma revista de comida impressa em papel encorpado. A página é papel; a madrugada aparece numa janela escura dentro dela.',
    refs: "GAIL's (serifa regular grande, botão fino), Kinfolk (respiro de revista), Bourke Street (creme amanteigado), Padoca do Maní (tom brasileiro afetivo), noma (ingrediente como objeto).",
    cores: [
      ['#F1EADF', 'Papel', 'fundo principal'],
      ['#E6DACA', 'Papel tostado', 'seções alternadas'],
      ['#231A14', 'Café', 'texto e botão principal'],
      ['#6B5747', 'Casca', 'texto secundário'],
      ['#A6461F', 'Forno', 'acento: marcador "agora", links'],
      ['#1E2A44', 'Madrugada', 'detalhe: só a janela da vitrine'],
    ],
    par: ['Libre Caslon Display', 'Figtree'],
    tipoNota: 'Caslon Display em peso regular para títulos (o Caslon é a letra dos impressos de padaria e jornal do século XIX); Figtree para texto, botões e números do cardápio. Hierarquia só por tamanho: 96 / 60 / 30 / 17 px.',
    foto: 'Luz natural de janela, grão leve, cor quente e consistente (mesmo tratamento em todas). Fotos grandes em cortes assimétricos que sangram até a borda da tela; nenhuma moldura.',
    filtro: 'none',
    botoes: 'Sólido café com texto papel, raio 2 px; secundário é link sublinhado fino; abas com sublinhado que desliza.',
    motion: [
      'Títulos sobem linha a linha atrás de uma máscara (SplitText, 1,1 s, expo.out); o parágrafo entra 0,2 s depois. Nada pula: tudo desacelera.',
      'Fotos abrem como uma janela: clip-path de inset(12%) até a borda enquanto a foto encolhe de 1,15 para 1 (scrub); no processo de 36 h, o pino horizontal passa as etapas em fotos de altura cheia sobre papel tostado.',
    ],
    problemas: [
      'Menu: barra de papel sólida desde o início, com fio de 1 px; o hero começa abaixo dela, então nunca cobre foto nem texto. Ao rolar, encolhe para 56 px e ganha leve desfoque sobre fotos.',
      'Vãos: sem cards; cada seção é uma grade de 12 colunas onde foto e texto ocupam linhas inteiras. O topo direito do cardápio passa a ser a própria foto, alinhada ao título.',
      'Hierarquia: um dominante por seção (o título de 96 px no hero, a foto de altura cheia no processo, a lista no cardápio). Escala 1,6× entre níveis e 120–160 px de respiro entre seções.',
    ],
    v1: 'Mantém: vitrine com relógio e linha do tempo, quadro de fornadas, pino das 36 h, contadores, abas, copy, SEO. Muda: o letreiro gigante "Sereno" vira wordmark discreto no menu (o título passa a ser a frase do hero); a porta de enrolar amarela vira uma abertura em clip-path; o split-flap vira números em Caslon que rolam dentro de uma máscara.',
    heroCss: `
:root{--papel:#F1EADF;--tostado:#E6DACA;--cafe:#231A14;--casca:#6B5747;--forno:#A6461F;--noite:#1E2A44}
body{background:var(--papel);color:var(--cafe)}
.top{height:72px;display:flex;align-items:center;gap:40px;padding:0 56px;border-bottom:1px solid rgba(35,26,20,.14);background:var(--papel)}
.marca{font:400 30px/1 Caslon,serif;letter-spacing:-.01em}.marca small{font:500 13px Figtree;color:var(--casca);margin-left:10px;letter-spacing:.01em}
nav{margin-left:auto;display:flex;gap:32px;font-size:15px;font-weight:500}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--cafe);color:var(--papel);font-weight:600;font-size:15px;padding:13px 20px;border-radius:2px}
.hero{display:grid;grid-template-columns:44% 56%;height:calc(100vh - 72px)}
.txt{padding:56px 56px 48px;display:flex;flex-direction:column;justify-content:center;gap:26px}
h1{font:400 92px/.98 Caslon,serif;letter-spacing:-.022em;max-width:9.5ch}
.sub{font-size:19px;line-height:1.55;color:var(--casca);max-width:34ch}
.acoes{display:flex;align-items:center;gap:28px}.link{font-weight:600;border-bottom:1px solid var(--forno);padding-bottom:3px}
.prox{display:flex;align-items:center;gap:10px;font-size:14.5px;color:var(--casca);padding-top:22px;border-top:1px solid rgba(35,26,20,.14)}
.prox i{width:8px;height:8px;border-radius:50%;background:var(--forno)}.prox b{color:var(--cafe);font-weight:600}
.janela{position:relative;overflow:hidden;background:var(--noite)}
.janela img{width:100%;height:100%;object-fit:cover;object-position:30% 60%;filter:brightness(.82)}
.janela::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,42,68,.55),rgba(30,42,68,0) 45%,rgba(20,14,10,.7));z-index:1}
.relogio{position:absolute;z-index:2;left:48px;bottom:44px;color:#F1EADF;display:grid;gap:8px}
.relogio .h{font:400 84px/1 Caslon,serif;letter-spacing:-.01em;font-variant-numeric:tabular-nums}.relogio .c{font-size:17px;font-weight:500}
${TL_CSS}
@media (max-width:600px){.top{height:60px;padding:0 18px}.top nav{display:none}.marca small{display:none}.btn.topo{margin-left:auto;padding:10px 14px;font-size:14px}
.hero{display:block;height:auto}.txt{padding:34px 18px 28px;gap:20px}h1{font-size:46px}.sub{font-size:16.5px}.acoes{gap:18px;flex-wrap:wrap}
.prox{display:block;line-height:1.5}.prox i{display:inline-block;margin-right:8px}.janela{height:420px}.relogio{left:18px;bottom:24px}.relogio .h{font-size:58px}}`,
    heroHtml: () => `<header class="top"><span class="marca">Sereno<small>forno &amp; café</small></span>
<nav><a>Fornadas</a><a>Como fazemos</a><a>Cardápio</a><a>Visite</a></nav><a class="btn topo">Pedir pelo WhatsApp</a></header>
<section class="hero"><div class="txt">
<h1>Enquanto o bairro dorme, a&nbsp;massa trabalha.</h1>
<p class="sub">Pão de fermentação natural com hora marcada para sair do forno, e café do Maciço de Baturité coado na hora.</p>
<div class="acoes"><a class="btn">Pedir pelo WhatsApp</a><a class="link">Ver fornadas de hoje</a></div>
<p class="prox"><i></i>Próxima fornada: <b>focaccia de queijo coalho, às 9h30</b></p></div>
<div class="janela"><img src="${IMG('fogo')}" alt=""><div class="relogio"><span class="h">04:30</span><span class="c">O forno acende.</span>${linha('#F1EADF', '#D9774A', 0.375)}</div></div></section>`,
    tileFoto: ['maos-pao', 'casca', 'levain'],
    tileFiltro: '',
  },
  {
    id: 'B-madrugada',
    nome: 'B · Madrugada',
    tese: 'Cinema escuro que amanhece. A página começa na madrugada (café-preto e azul-noite, produto iluminado como joia) e vai clareando até o papel do dia no cardápio e na visita.',
    refs: 'Lune (produto iluminado no escuro), Hart Bageri (vídeo de mãos em tela cheia), Tartine (foto escurecida com texto direto), Poilâne (menu transparente sobre foto escura), Graza (um único acento saturado).',
    cores: [
      ['#14100D', 'Café-preto', 'fundo da madrugada'],
      ['#1B2236', 'Noite', 'detalhe: degradê do céu no hero'],
      ['#EDE4D6', 'Papel', 'texto no escuro e fundo do "dia"'],
      ['#B9A893', 'Farinha', 'texto secundário no escuro'],
      ['#D9774A', 'Brasa', 'acento: botão e marcador "agora"'],
      ['#2A1E17', 'Casca', 'seções intermediárias'],
    ],
    par: ['Libre Caslon Display', 'Figtree'],
    tipoNota: 'Caslon Display muito grande e claro sobre o escuro (o contraste de fino e grosso brilha como a casca na luz); Figtree para texto e interface. O relógio da vitrine vira o maior elemento tipográfico da primeira tela.',
    foto: 'Clave baixa: fundo quase preto, uma luz lateral quente batendo na casca, farinha caindo, vapor do café contra o escuro. Vídeo HyperFrames de tela cheia no hero com o mesmo tratamento.',
    filtro: 'brightness(.86) contrast(1.12)',
    botoes: 'Sólido brasa com texto café-preto (contraste 6,5:1), raio 2 px; secundário com borda de 1 px papel; no "dia", os mesmos botões em café sobre papel.',
    motion: [
      'Hero: o vídeo abre do preto em 1,6 s com um empurrão lento de câmera; o relógio rola os dígitos (03:40 → 04:30 → 06:00) em máscara, e a linha do tempo leva a brasa até as 6h.',
      'Amanhecer no scroll: durante o pino horizontal das 36 h, o fundo vai do café-preto ao papel (scrub), e a última etapa, "Na sua mesa", já entra com luz de dia. É uma única transição de tema, com motivo narrativo.',
    ],
    problemas: [
      'Menu: transparente só sobre o topo do hero, onde um degradê azul-noite garante contraste; a partir de 40 px de rolagem vira café-preto 88% com desfoque e fio inferior. O conteúdo do hero fica abaixo da faixa de 72 px.',
      'Vãos: seções escuras de tela cheia (foto ou vídeo de ponta a ponta) e seções de papel em grade; nenhuma célula vazia: o bento vira 3 linhas de foto + texto.',
      'Hierarquia: na madrugada, a luz é a hierarquia (só o produto e o título iluminados); depois do amanhecer, um título dominante por seção e o resto em corpo 17 px.',
    ],
    v1: 'Mantém tudo do esqueleto (vitrine e relógio crescem e viram o centro do hero, pino das 36 h, quadro, contadores, abas, copy, SEO). Muda: o hero passa a ser vídeo de tela cheia (versões 16:9 e 9:16 do HyperFrames); a faixa de ingredientes vira texto Caslon claro sobre café-preto; o quadro de fornadas fica no escuro, como um painel de estação iluminado.',
    heroCss: `
:root{--preto:#14100D;--noite:#1B2236;--papel:#EDE4D6;--farinha:#B9A893;--brasa:#D9774A}
body{background:var(--preto);color:var(--papel)}
.hero{position:relative;height:100vh;overflow:hidden}
.hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 56%;filter:brightness(.86) contrast(1.12)}
.hero::before{content:"";position:absolute;inset:0;z-index:1;background:
linear-gradient(180deg,rgba(27,34,54,.82) 0%,rgba(27,34,54,0) 26%),
linear-gradient(0deg,rgba(20,16,13,.92) 0%,rgba(20,16,13,.35) 42%,rgba(20,16,13,0) 62%),
linear-gradient(90deg,rgba(20,16,13,.7) 0%,rgba(20,16,13,0) 55%)}
.top{position:absolute;z-index:3;top:0;left:0;right:0;height:72px;display:flex;align-items:center;gap:40px;padding:0 56px}
.marca{font:400 30px/1 Caslon,serif}.marca small{font:500 13px Figtree;color:var(--farinha);margin-left:10px}
nav{margin-left:auto;display:flex;gap:32px;font-size:15px;font-weight:500}
.btn{display:inline-flex;background:var(--brasa);color:var(--preto);font-weight:650;font-size:15px;padding:13px 20px;border-radius:2px}
.btn.linha{background:transparent;color:var(--papel);border:1px solid rgba(237,228,214,.6)}
.relogio{position:absolute;z-index:2;right:56px;top:128px;text-align:right;display:grid;justify-items:end;gap:10px}
.relogio .h{font:400 150px/.9 Caslon,serif;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.relogio .c{font-size:18px;font-weight:500;color:var(--farinha)}
.txt{position:absolute;z-index:2;left:56px;bottom:56px;display:grid;gap:24px;max-width:760px}
h1{font:400 98px/.98 Caslon,serif;letter-spacing:-.022em}
.sub{font-size:19px;line-height:1.55;color:var(--farinha);max-width:40ch}
.acoes{display:flex;align-items:center;gap:16px}
.prox{position:absolute;z-index:2;right:56px;bottom:62px;font-size:14.5px;color:var(--farinha);display:flex;gap:10px;align-items:center}
.prox i{width:8px;height:8px;border-radius:50%;background:var(--brasa)}.prox b{color:var(--papel);font-weight:600}
${TL_CSS}
@media (max-width:600px){.top{height:60px;padding:0 18px}.top nav,.marca small{display:none}.top .btn{margin-left:auto;padding:10px 14px;font-size:14px}
.hero>img{object-position:55% 60%}.relogio{top:96px;right:auto;left:18px;text-align:left;justify-items:start}.relogio .h{font-size:84px}
.txt{left:18px;right:18px;bottom:30px;gap:18px}h1{font-size:46px}.sub{font-size:16px}.prox{display:none}.acoes{flex-wrap:wrap}}`,
    heroHtml: () => `<section class="hero"><img src="${IMG('croissant-farinha', 2400)}" alt="">
<header class="top"><span class="marca">Sereno<small>forno &amp; café</small></span><nav><a>Fornadas</a><a>Como fazemos</a><a>Cardápio</a><a>Visite</a></nav><a class="btn linha">Pedir pelo WhatsApp</a></header>
<div class="relogio"><span class="h">06:00</span><span class="c">Primeira fornada.</span>${linha('#EDE4D6', '#D9774A', 0.75)}</div>
<div class="txt"><h1>Enquanto o bairro dorme, a&nbsp;massa trabalha.</h1>
<p class="sub">Pão de fermentação natural com hora marcada para sair do forno, e café do Maciço de Baturité coado na hora.</p>
<div class="acoes"><a class="btn">Pedir pelo WhatsApp</a><a class="btn linha">Ver fornadas de hoje</a></div></div>
<p class="prox"><i></i>Próxima fornada: <b>focaccia, às 9h30</b></p></section>`,
    tileFoto: ['croissant-farinha', 'vapor', 'fogo'],
    tileFiltro: 'brightness(.86) contrast(1.12)',
  },
  {
    id: 'C-manteiga-e-oliva',
    nome: 'C · Manteiga e Oliva',
    tese: 'Mercearia fina contemporânea: fundo cor de manteiga, verde-oliva profundo e uma serifa condensada que fala alto sem gritar. A vitrine da madrugada vira a "comanda do dia", um bilhete com os horários.',
    refs: 'Graza (serifa condensada + um acento só no CTA), Bread Ahead (produto como textura), Flamingo Estate (natureza-morta de produto), Blue Bottle (cor de marca como detalhe), Bourke Street (ritmo de seções creme).',
    cores: [
      ['#F2E6C6', 'Manteiga', 'fundo principal'],
      ['#2E3626', 'Oliva', 'texto e seções escuras'],
      ['#5E4A2E', 'Rapadura', 'texto secundário'],
      ['#B4471F', 'Forno', 'acento: só CTA e "agora"'],
      ['#E3D2A6', 'Milho', 'faixas e linhas'],
      ['#1F2A44', 'Madrugada', 'detalhe: só a comanda da vitrine'],
    ],
    par: ['Instrument Serif', 'Figtree'],
    tipoNota: 'Instrument Serif (condensada, com itálico) em tamanhos enormes para títulos e preços; Figtree para texto e interface. A condensação deixa frases longas caberem em 2 linhas grandes.',
    foto: 'Natureza-morta de produto com luz de janela e sombras macias, muitas vistas de cima (casca, cestos, potes de rapadura e manteiga da terra); faixas full-bleed de textura entre seções.',
    filtro: 'saturate(1.04) brightness(1.03)',
    botoes: 'Pílula sólida forno com texto manteiga (raio total); secundário em pílula com borda oliva de 1 px; abas em pílulas pequenas.',
    motion: [
      'Títulos entram por máscara de linha com o itálico chegando 0,1 s depois; preços do cardápio rolam como números de balança ao trocar de aba.',
      'Faixas de foto full-bleed fazem parallax lento e a "comanda" da vitrine desliza para dentro e marca o horário atual; no processo, o pino horizontal mostra as etapas como bilhetes sobre a faixa de foto.',
    ],
    problemas: [
      'Menu: barra manteiga sólida com fio oliva; ao rolar ganha 92% de opacidade e desfoque e some ao descer, voltando ao subir. Hero começa abaixo da barra.',
      'Vãos: grade de 12 colunas com faixas de foto de ponta a ponta separando seções; nada de célula vazia: o bento vira duas linhas (foto larga + 3 textos).',
      'Hierarquia: o título condensado de 150 px é o dominante; a comanda e a foto são coadjuvantes; corpo sempre 17 px; respiro de 140 px entre seções.',
    ],
    v1: 'Mantém o esqueleto inteiro. Muda: a vitrine deixa de ser vídeo dentro de moldura e vira foto/vídeo largo + a comanda com os horários (relógio e linha do tempo continuam, como lista); botões viram pílulas. É a direção mais distante do "creme + serifa" padrão, com mais personalidade de marca.',
    heroCss: `
:root{--manteiga:#F2E6C6;--oliva:#2E3626;--rapadura:#5E4A2E;--forno:#B4471F;--milho:#E3D2A6;--noite:#1F2A44}
body{background:var(--manteiga);color:var(--oliva)}
.top{height:72px;display:flex;align-items:center;gap:40px;padding:0 48px;border-bottom:1px solid rgba(46,54,38,.25);background:var(--manteiga)}
.marca{font:400 34px/1 Instrument,serif}.marca small{font:500 13px Figtree;color:var(--rapadura);margin-left:10px}
nav{margin-left:auto;display:flex;gap:30px;font-size:15px;font-weight:500}
.btn{display:inline-flex;background:var(--forno);color:var(--manteiga);font-weight:600;font-size:15px;padding:13px 22px;border-radius:999px}
.btn.linha{background:transparent;color:var(--oliva);border:1px solid var(--oliva)}
.hero{height:calc(100vh - 72px);display:grid;grid-template-rows:auto 1fr}
.cabeca{display:grid;grid-template-columns:1fr 360px;gap:48px;align-items:end;padding:40px 48px 32px}
h1{font:400 142px/.86 Instrument,serif;letter-spacing:-.025em}h1 em{font-style:italic}
.lado{display:grid;gap:20px;padding-bottom:12px}.sub{font-size:18px;line-height:1.5;color:var(--rapadura)}
.acoes{display:flex;gap:12px;flex-wrap:wrap}
.faixa{position:relative;overflow:hidden}.faixa img{width:100%;height:100%;object-fit:cover;object-position:50% 40%;filter:saturate(1.04) brightness(1.03)}
.comanda{position:absolute;right:48px;top:28px;bottom:28px;width:300px;background:var(--noite);color:var(--manteiga);border-radius:6px;padding:26px 26px 22px;display:flex;flex-direction:column;gap:14px}
.comanda .t{font-size:13px;font-weight:600;color:#C9B98F}.comanda .h{font:400 92px/.9 Instrument,serif;font-variant-numeric:tabular-nums}
.comanda ul{list-style:none;display:grid;gap:8px;font-size:14.5px;margin-top:auto;border-top:1px solid rgba(242,230,198,.25);padding-top:14px}
.comanda li{display:flex;justify-content:space-between}.comanda li.agora{color:#F2A07E;font-weight:600}
${TL_CSS}
@media (max-width:600px){.top{height:60px;padding:0 18px}.top nav,.marca small{display:none}.top .btn{margin-left:auto;padding:10px 16px;font-size:14px}
.hero{height:auto;display:block}.cabeca{display:block;padding:26px 18px}h1{font-size:72px}.lado{margin-top:18px}
.faixa{height:440px}.comanda{left:18px;right:18px;width:auto;top:auto;bottom:18px;padding:18px}.comanda .h{font-size:62px}.comanda ul{display:none}}`,
    heroHtml: () => `<header class="top"><span class="marca">Sereno<small>forno &amp; café</small></span><nav><a>Fornadas</a><a>Como fazemos</a><a>Cardápio</a><a>Visite</a></nav><a class="btn">Pedir pelo WhatsApp</a></header>
<section class="hero"><div class="cabeca"><h1>Enquanto o bairro dorme, <em>a massa trabalha.</em></h1>
<div class="lado"><p class="sub">Pão de fermentação natural com hora marcada para sair do forno, e café do Maciço de Baturité coado na hora.</p>
<div class="acoes"><a class="btn">Pedir pelo WhatsApp</a><a class="btn linha">Fornadas de hoje</a></div></div></div>
<div class="faixa"><img src="${IMG('casca', 2400)}" alt=""><aside class="comanda"><span class="t">Madrugada no forno, hoje</span><span class="h">04:30</span>${linha('#F2E6C6', '#E8794F', 0.375)}
<ul><li><span>03:40</span><span>o levain acorda</span></li><li class="agora"><span>04:30</span><span>o forno acende</span></li><li><span>06:00</span><span>primeira fornada</span></li><li><span>09:30</span><span>focaccia</span></li></ul></aside></div></section>`,
    tileFoto: ['casca', 'paes', 'chaleira'],
    tileFiltro: 'saturate(1.04) brightness(1.03)',
  },
];

const pagina = (titulo, css, corpo) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title><style>${FONTES}${BASE}${css}</style></head><body class="grao">${corpo}</body></html>`;

function tile(d) {
  const [corFundo, , corTexto] = [d.cores[0][0], 0, d.cores[2][0]];
  const disp = d.par[0] === 'Instrument Serif' ? 'Instrument' : 'Caslon';
  const escuro = d.id.startsWith('B');
  const fundo = escuro ? '#14100D' : corFundo;
  const tinta = escuro ? '#EDE4D6' : corTexto;
  const suave = escuro ? '#B9A893' : d.cores[3][0];
  const acento = d.cores.find((c) => /acento/.test(c[2]))[0];
  const btnTxt = d.id.startsWith('B') ? '#14100D' : d.id.startsWith('C') ? '#F2E6C6' : '#F1EADF';
  const raio = d.id.startsWith('C') ? '999px' : '2px';
  const css = `
body{background:${fundo};color:${tinta};padding:56px 64px 64px;width:1440px}
h1{font:400 64px/1 ${disp},serif;letter-spacing:-.02em}h2{font:500 13px Figtree;letter-spacing:.02em;color:${suave};margin:0 0 14px}
.tese{font-size:18px;line-height:1.55;max-width:70ch;margin-top:14px}.refs{font-size:14px;color:${suave};margin-top:10px;max-width:110ch}
.grade{display:grid;grid-template-columns:repeat(12,1fr);gap:28px;margin-top:44px}
.c4{grid-column:span 4}.c5{grid-column:span 5}.c6{grid-column:span 6}.c7{grid-column:span 7}.c8{grid-column:span 8}.c12{grid-column:span 12}
.cores{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.cor div{height:96px;border-radius:3px;border:1px solid rgba(128,128,128,.25)}
.cor b{display:block;margin-top:8px;font-size:14px}.cor span{font-size:12.5px;color:${suave}}
.esp .d{font:400 76px/1 ${disp},serif;letter-spacing:-.02em}.esp .h3{font:400 32px/1.1 ${disp},serif;margin-top:16px}
.esp p{font-size:17px;line-height:1.6;max-width:52ch;margin-top:12px}.esp .num{font:400 40px/1 ${disp},serif;margin-top:16px;font-variant-numeric:tabular-nums}
.nota{font-size:14.5px;line-height:1.55;color:${suave};margin-top:12px}
.fotos{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px}.fotos img{width:100%;height:300px;object-fit:cover;filter:${d.tileFiltro || 'none'}}
.ui{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.b1{background:${acento === '#A6461F' ? '#231A14' : acento};color:${btnTxt};padding:13px 20px;border-radius:${raio};font-weight:650;font-size:15px}
.b2{border:1px solid ${tinta};padding:12px 20px;border-radius:${raio};font-weight:600;font-size:15px}
.abas{display:flex;gap:26px;font-weight:600;font-size:15px;margin-top:20px}.abas span{padding-bottom:6px;opacity:.6}.abas span.on{opacity:1;border-bottom:2px solid ${acento}}
.linha{display:grid;grid-template-columns:90px 1fr auto;gap:20px;align-items:baseline;padding:14px 0;border-top:1px solid rgba(128,128,128,.3);font-size:16px}
.linha .h{font:400 32px/1 ${disp},serif;font-variant-numeric:tabular-nums}.linha .e{font-size:14px;color:${suave};display:flex;gap:8px;align-items:center}
.e i{width:10px;height:10px;border-radius:50%;border:1.5px solid ${tinta}}.e i.cheio{background:${tinta}}.e i.meio{background:linear-gradient(90deg,${tinta} 50%,transparent 50%)}
.agora{display:flex;align-items:center;gap:10px;color:${acento === '#A6461F' ? '#A6461F' : acento};font-size:13px;font-weight:650}.agora::after{content:"";flex:1;height:1px;background:currentColor}
.menu-rolado{margin-top:18px;height:56px;border-radius:3px;display:flex;align-items:center;gap:26px;padding:0 20px;font-size:14px;
background:${escuro ? 'rgba(20,16,13,.88)' : fundo};backdrop-filter:blur(10px);border:1px solid rgba(128,128,128,.3)}
.menu-rolado b{font:400 22px ${disp},serif;margin-right:auto}
.lista{display:grid;gap:12px;font-size:15px;line-height:1.55}.lista li{list-style:none;padding-left:18px;position:relative}.lista li::before{content:"";position:absolute;left:0;top:.62em;width:8px;height:1px;background:${acento}}
.bloco{padding-top:18px;border-top:1px solid rgba(128,128,128,.35)}`;
  const corpo = `
<h1>${d.nome}</h1><p class="tese">${d.tese}</p><p class="refs">Referências: ${d.refs}</p>
<div class="grade">
<div class="c12"><h2>Paleta</h2><div class="cores">${d.cores.map(([hex, nome, papel]) => `<div class="cor"><div style="background:${hex}"></div><b>${nome} ${hex}</b><span>${papel}</span></div>`).join('')}</div></div>
<div class="c7 esp bloco"><h2>Tipografia: ${d.par[0]} + ${d.par[1]}</h2><div class="d">O que sai do forno hoje</div><div class="h3">Café do Maciço de Baturité</div>
<p>Grão sombreado, torrado em lotes pequenos toda segunda. O coado sai na hora, na V60, com água a 92 °C.</p><div class="num">06:00 · 09:30 · R$ 28</div><p class="nota">${d.tipoNota}</p></div>
<div class="c5 bloco"><h2>Botões e interface</h2><div class="ui"><span class="b1">Pedir pelo WhatsApp</span><span class="b2">Ver fornadas de hoje</span></div>
<div class="abas"><span class="on">Pães</span><span>Doces e bolos</span><span>Café</span><span>Brunch de sábado</span></div>
<div style="margin-top:18px"><div class="linha"><span class="h">08:00</span><span>Pão de queijo coalho</span><span class="e"><i class="cheio"></i>saiu às 8h</span></div>
<div class="agora">agora, 9h12</div><div class="linha"><span class="h">09:30</span><span>Focaccia de queijo coalho e mel de engenho</span><span class="e"><i class="meio"></i>no forno</span></div></div>
<div class="menu-rolado"><b>Sereno</b><span>Fornadas</span><span>Cardápio</span><span>Visite</span><span class="b1" style="padding:8px 14px;font-size:13px">Pedir pelo WhatsApp</span></div>
<p class="nota">${d.botoes} Acima: o menu depois de rolar.</p></div>
<div class="c12 bloco"><h2>Tratamento de foto</h2><div class="fotos">${d.tileFoto.map((n) => `<img src="${IMG(n, 1200)}" alt="">`).join('')}</div><p class="nota">${d.foto}</p></div>
<div class="c4 bloco"><h2>Motion (2 exemplos)</h2><ul class="lista">${d.motion.map((m) => `<li>${m}</li>`).join('')}</ul></div>
<div class="c4 bloco"><h2>Os 3 problemas da v1</h2><ul class="lista">${d.problemas.map((m) => `<li>${m}</li>`).join('')}</ul></div>
<div class="c4 bloco"><h2>O que muda em relação à v1</h2><p class="nota" style="color:inherit;font-size:15px">${d.v1}</p></div>
</div>`;
  return pagina(`${d.nome} · style tile`, css, corpo);
}

await mkdir('docs/direcoes', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const abrir = async (arq, opts, saida, full = false) => {
  const p = await browser.newPage(opts);
  await p.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/docs/direcoes/' + arq, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'docs/direcoes/' + saida, fullPage: full });
  await p.close();
};
for (const d of DIRECOES) {
  await writeFile(`docs/direcoes/${d.id}-hero.html`, pagina(`${d.nome} · hero`, d.heroCss, d.heroHtml()));
  await writeFile(`docs/direcoes/${d.id}-tile.html`, tile(d));
  await abrir(`${d.id}-hero.html`, { viewport: { width: 1440, height: 900 } }, `${d.id}-hero.png`);
  await abrir(`${d.id}-hero.html`, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }, `${d.id}-hero-celular.png`);
  await abrir(`${d.id}-tile.html`, { viewport: { width: 1440, height: 900 } }, `${d.id}-tile.png`, true);
  console.log(d.id, 'ok');
}
await browser.close();
