# Créditos

## Imagens geradas por IA (ilustrações, não são fotos reais)

Geradas em 03/10/2026 no **ChatGPT** do George, a partir dos prompts de `docs/direcoes/prompts-ia-B.md` (direção B: clave baixa, luz quente da esquerda, paleta café-preto/papel/farinha/brasa). Não mostram a padaria nem produtos reais; na página, o rodapé avisa que algumas imagens são ilustrações geradas por IA. Originais em `assets-src/ia/` (fora do git); `npm run imagens` gera as versões web com o prefixo `ia-`.

| Arquivo | Onde aparece |
|---|---|
| hero-cestos (16:9 e 9:16) | Vídeo do hero, cena 03:40 |
| hero-forno (16:9 e 9:16) | Vídeo do hero, cena 04:30 (só no pôster e como reserva; ver o vídeo do Google Flow abaixo) |
| hero-fornada (16:9 e 9:16) | Vídeo do hero, cena 06:00 |
| ia-hero-cestos-9x16 | Processo (10h, modelar e dormir no frio) |
| ia-hero-forno-9x16 | Processo (34h, cortar e assar) |
| ia-hero-fornada-9x16 | Visite (foto grande ao lado dos horários) |
| ia-maos-massa | Processo (4h, dobrar a massa) |
| ia-miolo | Processo (36h, na sua mesa) e cardápio (torrada de levain) |
| ia-cafe-vapor | Do Nordeste (café do Maciço de Baturité, com vapor animado) e cardápio |
| ia-nordeste | Do Nordeste (abertura: queijo coalho, rapadura, manteiga da terra) |

No vídeo 16:9 as três imagens do hero foram espelhadas na horizontal para o produto ficar à direita e o texto da página pousar sobre a área escura.

## Vídeo gerado por IA (Google Flow / Veo 3.1 Fast)

`assets-src/ia/video/flow-forno-16x9.mp4` (8 s, 1920×1080), gerado no Google Flow do George a partir de hero-forno-16x9: empurrão lento, brasas e fagulhas vivas. Na composição do hero entra só o trecho de 0 a 3,7 s (antes de o braço com a pá aparecer), **sem áudio**, em fusão sobre a cena 04:30; no 16:9 espelhado como as imagens, no 9:16 recortado no arco do forno. É uma ilustração gerada por IA, não filmagem real.

## Fotos de banco

Do **Unsplash**, sob a [Licença Unsplash](https://unsplash.com/license) (uso comercial gratuito, sem exigir atribuição; creditamos mesmo assim). Nenhuma mostra rosto de pessoa em depoimento. Originais baixados em 03/10/2026 com `npm run baixar-fotos`; `npm run imagens` aplica a todas o mesmo tratamento de cor quente.

| Arquivo | Autor | Foto original | Onde aparece |
|---|---|---|---|
| levain | Margaret Jaszowska | https://unsplash.com/photos/eWLshlonxtg | Processo (0h), com filtro quente forte |
| paes | Alex Preusser | https://unsplash.com/photos/9__89QmmyxU | Cardápio (ciabatta) |
| croissant | Conor Brown | https://unsplash.com/photos/sqkXyyj4WdE | Cardápio (brioche) |
| focaccia | Diego Arenas de Rodrigo | https://unsplash.com/photos/kOU7kMox_2Y | Cardápio (focaccia) |
| pao-de-queijo | rodolfo allen_ | https://unsplash.com/photos/mOedSrS6qS0 | Cardápio (pão de queijo, cuscuz) |
| bolo | Stephen Kidd | https://unsplash.com/photos/YM9GYuBhxoc | Cardápio (bolos) |
| coado | Najib Kalil | https://unsplash.com/photos/x-8DF-Ry0Zo | Cardápio (café gelado) |
| espresso | Nathan Dumlao | https://unsplash.com/photos/So7cyDtlmls | Cardápio (espresso) |
| cappuccino | Christopher Yiu Chung | https://unsplash.com/photos/lMSmhRDS0Ik | Cardápio (cappuccino) |
| prateleira | Maite Paternain | https://unsplash.com/photos/UVNguozJOPE | Do Nordeste (nada vai para o lixo) |
| chaleira | Gaia&Co | https://unsplash.com/photos/frP4Myn3St4 | Cardápio (coado) |
| croissant-farinha | Mae Mu | https://unsplash.com/photos/m9pzwmxm2rk | Cardápio (croissant, prato Sereno) |
| casca | Maria Orlova | https://unsplash.com/photos/kU7TkW9FIJY | Cardápio (foto padrão, pão de fermentação natural) |
| maos-pao | Franzi Meyer | https://unsplash.com/photos/7ARN514bTuA | Cardápio (pão de milho) |

Baixadas mas fora desta versão (usadas na v1, trocadas por imagens próprias ou só nos estudos de direção): dobras (Skyler Ewing), cestos (Diego Arenas de Rodrigo), corte (Diego Arenas de Rodrigo), forno (Yasin Onus), miolo (Vicky Ng), pao (Ben Garratt), pao-mao (Monika Grabkowska), balcao (Ceba Solutions), vapor (Florian Siedl), fogo (DDP).

## Vídeo

Os dois vídeos do hero (`public/video/madrugada-16x9.*` e `madrugada-9x16.*`) foram montados com **HyperFrames** (HTML + GSAP renderizado em MP4) a partir das imagens de IA hero-cestos, hero-forno e hero-fornada e do trecho do vídeo do Google Flow na cena do forno, com poeira de farinha gerada por código (semente fixa) e fusões de brasa. Código em `video/`.

## Fontes (SIL Open Font License 1.1)

- **Libre Caslon Display**, de Impallari Type (Google Fonts), servida de `public/fonts/`.
- **Figtree**, de Erik Kennedy (Google Fonts), servida de `public/fonts/`.

## Ícones

**Phosphor Icons** (MIT), estilo bold, embutidos como SVG no build.

## Bibliotecas

- GSAP 3 com ScrollTrigger e SplitText (licença padrão GreenSock, gratuita inclusive para uso comercial desde 2025).
- Lenis (MIT).
- Vite (MIT).

## Referências visuais

Os prints em `docs/referencias/` são capturas de sites reais (GAIL's, Poilâne, Hart Bageri, Bourke Street, Tartine, Lune, Graza, Fabrique, Bread Ahead, Kinfolk, noma, Flamingo Estate, Blue Bottle, Padoca do Maní, Bernice, Coffee Lab), usadas só como estudo interno de direção de arte. Não são material da página e não devem ser publicadas.

## Marca

"Sereno Forno & Café" é uma **marca fictícia** criada para este projeto conceitual. Endereço, horários, preços e depoimentos também são fictícios.
