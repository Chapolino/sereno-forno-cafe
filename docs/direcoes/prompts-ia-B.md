# Prompts de imagem e vídeo por IA · direção B (Madrugada)

Para o George rodar nas contas dele (ChatGPT para imagens; Gemini e Google Flow/Veo para imagem e vídeo). Esta versão da página usa fotos do Unsplash com o mesmo tratamento quente; ao trocar por imagens próprias, salve em `assets-src/ia/` com os nomes abaixo, rode `npm run imagens` e troque o nome na tag `<foto nome="...">` do `index.html` (ou mantenha o mesmo nome do arquivo para trocar sem mexer no código).

## Base comum (cole no início de todos)

> Fotografia editorial de padaria artesanal brasileira na madrugada. Clave baixa: fundo quase preto (#14100D), uma única luz lateral quente vinda da esquerda (como a boca de um forno a lenha), sombras profundas e macias. Paleta: café-preto, papel (#EDE4D6), farinha (#B9A893) e brasa (#D9774A). Lente 50 mm, f/2, foco curto, granulação fina de filme, cor quente e contida. Sem pessoas de rosto visível, sem texto, sem logotipos, sem marcas. Realista, nada de aparência de ilustração ou 3D.

## Peças

| Arquivo | Proporção | Prompt específico | Onde entra |
|---|---|---|---|
| `hero-cestos` | 16:9 e 9:16 | Dois pães modelados descansando em cestos de fermentação de vime com pano de linho, farinha na superfície, vistos de cima a 45°. | Cena 1 do vídeo (03:40) |
| `hero-forno` | 16:9 e 9:16 | Boca de um forno a lenha de tijolos às 4h30 da manhã, brasas acesas, uma pá de madeira entrando, fagulhas no ar. | Cena 2 do vídeo (04:30) |
| `hero-fornada` | 16:9 e 9:16 | Pães de fermentação natural recém-saídos do forno sobre uma tábua escura, vapor subindo na luz lateral, farinha caindo em suspensão. | Cena 3 do vídeo (06:00) |
| `maos-massa` | 4:5 | Mãos enfarinhadas dobrando uma massa de pão sobre bancada de madeira escura, farinha no ar. | Processo (4h) |
| `miolo` | 4:5 | Pão de fermentação natural partido ao meio, miolo alveolado e casca escura brilhando na luz lateral. | Processo (36h) |
| `cafe-vapor` | 4:5 | Café coado numa xícara de cerâmica escura, vapor visível contra o fundo preto, grãos espalhados. | Do Nordeste (café) |
| `nordeste` | 16:10 | Natureza-morta: queijo coalho, rapadura, manteiga da terra num pote de barro e uma focaccia, sobre mesa de madeira escura. | Do Nordeste (abertura) |

## Vídeo (Google Flow / Veo)

> Plano de 8 segundos, câmera quase parada com empurrão lento para frente, em uma padaria artesanal às 4h da manhã: a boca de um forno a lenha acesa, fagulhas subindo, uma pá de madeira entra e retira pães dourados. Clave baixa, uma luz quente lateral, poeira de farinha no ar, granulação de filme. Sem pessoas de rosto visível, sem texto. Loop: o último quadro igual ao primeiro.

Gere em 16:9 e 9:16. Se ficar bom, ele substitui as fotos dentro das composições HyperFrames (`video/sereno-madrugada*`), que já fazem o loop, as fusões e a poeira.
