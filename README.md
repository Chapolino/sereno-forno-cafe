# Sereno Forno & Café: landing page conceitual

Peça de portfólio nº 3 (ver `X:\Projetos\negocios\portfolio\plano-portfolio.md`). Padaria de fermentação natural e café **fictícia** no Crato (CE): marca, endereço, preços, horários e depoimentos são inventados e rotulados como tal na página.

```powershell
npm install ; npm run dev      # rodar (http://localhost:5190)
npm run build                  # gerar dist/ (estático, pronto para Vercel/GitHub Pages)
```

`npm run preview` serve o `dist/` em http://localhost:4190. Para ver o quadro de fornadas num horário fixo: `?hora=09:12&dia=sab` (dia: dom, seg, ter, qua, qui, sex, sab; segunda mostra o estado "forno de folga"). `?cardapio=cafe` abre o cardápio na aba Café.

## Direção de arte (B · Madrugada)

Escolhida pelo George entre três direções (`docs/direcoes/index.html`), depois de um estudo de 15 referências reais (`docs/referencias/moodboard.html`). A página começa na madrugada (café-preto, fotos em clave baixa, vídeo em tela cheia) e **amanhece** durante o processo das 36 horas; o dia segue até o rodapé, quando a noite volta.

- Paleta: café-preto `#14100D`, papel `#EDE4D6`, farinha `#B9A893`, brasa `#D9774A` (único acento), noite `#1B2236` só como detalhe (céu do hero, placa de rua).
- Tipografia: Libre Caslon Display (títulos, horários, preços) + Figtree (texto e interface).
- Fotos grandes, sem moldura, com o mesmo tratamento de cor quente; botões finos, raio 2 px, sem sombra dura.

A v1 ("letreiro pintado", anil e amarelo) está preservada no commit `ae079c9` / tag `v1-letreiro`; prints e demos dela em `docs/prints/antes/`.

## O que tem na página

| Seção | O que faz | Motion |
|---|---|---|
| Hero | Vídeo HyperFrames (imagens próprias por IA) em tela cheia (16:9 no desktop, 9:16 no celular) com o relógio da madrugada sincronizado ao vídeo (03:40 a massa descansa · 04:30 o forno acende · 06:00 primeira fornada) e a linha do tempo 3h–7h | Título sobe linha a linha atrás de máscara; dígitos do relógio rolam a cada cena; a câmera se afasta ao rolar |
| Quadro de fornadas | O que sai do forno hoje no horário real do Crato (America/Fortaleza): saiu, no forno, mais tarde (forma + texto, não só cor) e o marcador "agora". "Me avise" abre o WhatsApp com a mensagem pronta | Horários rolam em máscara e as linhas entram em cascata |
| Faixa de ingredientes | O único marquee | Acelera e inverte com a velocidade da rolagem |
| 36 horas para um pão | O processo em 5 etapas | Pino horizontal (desktop) com relógio 0h→36h, barra de progresso e o fundo que amanhece (madrugada → aurora → dia); no celular, o amanhecer acontece sem pino |
| Do Nordeste para o forno | 4 blocos: ingredientes, café do Maciço de Baturité (com vapor animado em SVG), 36 h, sobras | Fotos abrem como janela (clip-path) e assentam (scale); contador 0→36 |
| Cardápio | Abas acessíveis (setas do teclado, URL), preços fictícios, foto que acompanha o item | Traço da aba desliza, itens em cascata, foto em fusão |
| Depoimentos | 3 citações fictícias, botões e arrastar no toque | Linhas sobem a cada troca |
| Visite | Status "aberto agora", horários com o dia de hoje destacado, reserva do brunch, placa de rua | Placa balança ao ser pendurada |
| Rodapé | "Sereno" gigante + aviso de projeto conceitual + créditos | Letras sobem com a rolagem |

O menu é transparente só sobre o topo do vídeo (onde um degradê garante contraste) e vira café-preto translúcido com desfoque a partir de 40 px de rolagem; some ao descer e volta ao subir.

Com `prefers-reduced-motion`: sem Lenis, sem pino (as 5 etapas viram grade), vídeo parado no pôster com botão "Tocar vídeo", relógio fixo. O vídeo sempre tem botão de pausar (WCAG 2.2.2).

## Estrutura

```
index.html              página (tags <foto> e <i data-icon> são expandidas no build pelo vite.config.js)
src/main.js             motion (GSAP + ScrollTrigger + SplitText + Lenis) e interações
src/fornadas.js         quadro de fornadas e status da loja (fuso America/Fortaleza)
src/styles.css          estilos (tokens no :root)
public/img/             fotos em AVIF + WebP, 480/800/1200/1600/2400 px, tratamento de cor único
public/video/           vídeos do hero (16:9 e 9:16, MP4 + WebM) e pôsteres AVIF/WebP
public/fonts/           Libre Caslon Display e Figtree (OFL), servidas pelo próprio site
video/                  gerador e código das composições HyperFrames do hero
docs/referencias/       15 referências reais, moodboard
docs/direcoes/          3 direções (style tiles + mockups) e prompts de IA para a direção B
docs/prints/            prints de cada seção (desktop 1440×900 e celular 390×844); antes/ = v1
docs/demo-*.mp4         vídeos de demonstração rolando a página
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run baixar-fotos` | baixa os originais do Unsplash listados em `scripts/fotos.json` para `assets-src/fotos/` (fora do git) |
| `npm run imagens` | aplica o tratamento de cor e gera AVIF/WebP com ffmpeg; grava `scripts/dimensoes.json` |
| `node video/gerar-composicoes.mjs` | escreve as composições HyperFrames no Estúdio Criativo; render com `hf render` (ver `video/LEIA.md`) |
| `npm run icones` | gera favicons e `og.jpg` (precisa do `npm run dev` rodando) |
| `npm run prints` | prints de cada seção em `docs/prints/` (precisa do `npm run preview`) |
| `npm run demo` | grava `docs/demo-desktop.mp4`; `node scripts/demo.mjs mobile` grava o do celular |

Os scripts de captura usam o Chrome instalado (`playwright-core`, canal `chrome`).

## Antes de publicar

- Trocar o domínio provisório `https://sereno-forno.example/` em `public/robots.txt` e `public/sitemap.xml`, e deixar `og:image` absoluto.
- Se virar cliente real: número de WhatsApp em `https://wa.me/55DDDNUMERO?text=...`, endereço e horários reais em `index.html`, `src/fornadas.js` e no JSON-LD.
- O hero (imagens do ChatGPT + trecho de vídeo do Google Flow/Veo na cena do forno), 4 etapas do processo, o Nordeste e a Visite já usam imagens próprias por IA; o levain (0h) e o cardápio ainda usam fotos de banco. Para trocar mais: gerar com `docs/direcoes/prompts-ia-B.md`, salvar em `assets-src/ia/`, rodar `npm run imagens` e usar `nome="ia-<arquivo>"` na tag `<foto>`.
- As referências visuais estudadas (prints de sites de terceiros) não fazem parte do repositório público.

Créditos de fotos, fontes e bibliotecas: `CREDITOS.md`.
