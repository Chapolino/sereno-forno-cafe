---
name: Sereno Forno & Café
description: Landing page conceitual de padaria de fermentação natural; a madrugada que amanhece.
colors:
  cafe-preto: "#14100d"
  casca: "#1d1712"
  aurora: "#4a2c1a"
  noite: "#1b2236"
  papel: "#ede4d6"
  papel-tostado: "#e3d7c4"
  farinha: "#b9a893"
  casca-texto: "#5a4636"
  brasa: "#d9774a"
  brasa-funda: "#973f1b"
typography:
  display:
    fontFamily: "Libre Caslon Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.85rem, 1.2rem + 5.2vw, 6.1rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(2.35rem, 1.3rem + 3.6vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(1.45rem, 1.1rem + 1.2vw, 2.1rem)"
    fontWeight: 400
    lineHeight: 1.1
  numeral:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(4.5rem, 2rem + 6.5vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.9
    fontFeature: "tnum"
  body:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree Variable, Figtree, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "2px"
  pill: "999px"
spacing:
  gutter: "clamp(18px, 4.2vw, 64px)"
  section: "clamp(6rem, 13vw, 11rem)"
  header: "72px"
components:
  button-primary:
    backgroundColor: "{colors.brasa}"
    textColor: "{colors.cafe-preto}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.45rem"
  button-ghost-night:
    textColor: "{colors.papel}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.45rem"
  button-dark-day:
    backgroundColor: "{colors.cafe-preto}"
    textColor: "{colors.papel}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.45rem"
  header-scrolled:
    backgroundColor: "{colors.cafe-preto}"
    textColor: "{colors.papel}"
    height: "72px"
---

# Design System: Sereno Forno & Café

## Overview

**Creative North Star: "A madrugada que amanhece"**

A página é uma noite de padaria vista de perto: fundo café-preto, fotos em clave baixa com uma única luz quente lateral, poeira de farinha no ar. Durante a leitura ela amanhece. O processo das 36 horas leva o fundo do café-preto à aurora e depois ao papel. O dia segue claro até o rodapé, onde a noite volta. O luxo vem da contenção: poucas cores, uma serifa de impressos antigos em tamanho grande, fotos sem moldura e um acento só.

A direção foi escolhida pelo cliente (direção B, `docs/direcoes/`) depois de um estudo de 15 referências reais. Ela recusa o "letreiro de lanchonete" da v1 (anil chapado, slab amarela com sombra dura, molduras grossas) e o "creme + serifa + terracota" genérico de padaria artesanal.

**Key Characteristics:**
- Noite → aurora → dia como espinha narrativa; uma transição de tema motivada, não seções alternando ao acaso.
- Foto é a estrela: sempre de ponta a ponta ou em blocos grandes, mesmo tratamento de cor quente.
- Hierarquia por escala, nunca por sombra: um elemento dominante por seção.
- Brasa é o único acento; o azul-noite aparece só como detalhe.

## Colors

Paleta tirada da própria comida e do forno: café, casca, farinha e brasa.

### Primary
- **Brasa** (#D9774A): botão principal, marcador "agora", ponto da próxima fornada, traço da linha do tempo. Sobre café-preto, o texto do botão é café-preto (6:1).
- **Brasa funda** (#973F1B): versão do acento para texto e indicadores sobre papel e papel tostado (≥ 4,7:1).

### Neutral
- **Café-preto** (#14100D): fundo da madrugada, texto do dia, rodapé.
- **Casca** (#1D1712): fundo do quadro de fornadas (um passo acima do café-preto).
- **Aurora** (#4A2C1A): estado intermediário do amanhecer no processo; só existe em transição.
- **Papel** (#EDE4D6): fundo do dia e texto da noite.
- **Papel tostado** (#E3D7C4): seções claras alternadas (cardápio, visite).
- **Farinha** (#B9A893): texto secundário na noite.
- **Casca-texto** (#5A4636): texto secundário no dia.
- **Noite** (#1B2236): só no degradê do céu no topo do hero.

### Named Rules
**The One Ember Rule.** A brasa é o único acento da página. Não entra uma segunda cor de destaque.
**The Daybreak Rule.** O fundo só muda de noite para dia uma vez, no processo, e por motivo narrativo. Fora dele, as seções alternam só entre tons da mesma fase do dia.

## Typography

**Display Font:** Libre Caslon Display (fallback Iowan Old Style, Palatino, Georgia)
**Body Font:** Figtree (variável, fallback system-ui)

**Character:** O Caslon é a letra dos impressos e jornais do século XIX; em tamanho grande, o contraste de fino e grosso brilha como casca na luz. A Figtree é neutra e calorosa, para não competir.

### Hierarchy
- **Display** (400, 2.85–6.1rem, lh 0.98): só o título do hero.
- **Numeral** (400, até 8–13rem, tabular): relógio do hero, contador 0h→36h. É o elemento dominante quando aparece.
- **Headline** (400, 2.35–4.6rem, lh 1.02): títulos de seção.
- **Title** (400, 1.45–2.1rem): títulos de bloco, dia da semana, endereço, preços.
- **Body** (Figtree 400, 1.0625rem, lh 1.6, máx. ~44ch): texto corrido.
- **Label** (Figtree 500, 0.85–0.95rem): estados, horários pequenos, navegação.

### Named Rules
**The Single Weight Rule.** O Caslon tem um peso só (400). A ênfase vem de tamanho e espaço, nunca de negrito falso, itálico inventado ou sombra.

## Layout

Grade de 12 colunas dentro de 1320 px, com respiro lateral `clamp(18px, 4.2vw, 64px)` somado à área segura do celular. Seções com 6–11rem de respiro vertical. Composições assimétricas: quadro 4/7, cardápio 7/5, visite meio a meio com a foto sangrando. O hero ocupa a tela inteira, com o título ancorado embaixo à esquerda e o relógio no alto à direita (no celular, no alto à esquerda). Abaixo de 900 px tudo vira uma coluna; o processo perde o pino e amanhece no próprio rolar.

## Elevation & Depth

Plano. A profundidade vem da luz das fotos e de véus em degradê (radial para o relógio, linear para o texto), nunca de sombra. A única camada "de vidro" é o menu depois de rolar: café-preto 86% com desfoque de 14 px e fio inferior de 1 px. Por cima de tudo há uma granulação de filme fixa (opacidade 0,07, sem custo de rolagem).

## Shapes

Raio de 2 px em botões e fotos, 0 nas fotos que sangram até a borda e círculos só em marcadores de estado (7–11 px). Divisórias são fios de 1 px. Nada de moldura, contorno duplo ou cantos arredondados grandes.

## Components

- **Botão principal:** brasa, texto café-preto, raio 2 px, 1rem × 1.45rem, peso 600; no hover clareia; ao clicar desce 1 px. No mouse, os botões grandes seguem levemente o cursor.
- **Botão de borda (noite):** fio de 1 px papel a 55%, fundo transparente; no hover o fio fica cheio.
- **Link:** sublinhado de 1 px que recolhe no hover e muda para brasa funda.
- **Menu:** transparente sobre o degradê do topo do hero; a partir de 40 px de rolagem fica café-preto com desfoque, o CTA vira brasa sólida e o menu some ao descer e volta ao subir.
- **Quadro de fornadas:** linhas com horário em Caslon (rola numa máscara ao entrar), nome, estado por forma (cheio = saiu, meio = no forno, contorno = mais tarde) mais texto, e "Me avise" em botão de borda. A régua "agora" é um fio brasa.
- **Abas do cardápio:** texto Figtree 600 com um traço brasa funda que desliza até a aba ativa.

## Do's and Don'ts

### Do:
- **Do** mostrar comida grande e sem moldura, sempre com o mesmo tratamento quente (`scripts/otimizar-imagens.mjs`).
- **Do** usar um elemento dominante por seção (relógio, quadro, contador, foto larga, citação, logo do rodapé).
- **Do** animar entradas com desaceleração longa (`expo.out`, 1,1–1,4 s): linhas atrás de máscara, fotos abrindo em clip-path.
- **Do** respeitar `prefers-reduced-motion`: sem Lenis, sem pino, vídeo parado no pôster.

### Don't:
- **Don't** voltar ao "letreiro de lanchonete" da v1: nada de slab amarela com sombra laranja, azul chapado de fundo ou moldura grossa amarela nas fotos.
- **Don't** usar sombra dura deslocada em botões ou textos.
- **Don't** colocar uma segunda cor de destaque além da brasa.
- **Don't** inventar números com cara de precisão: dados de marca fictícia ficam rotulados como fictícios.
