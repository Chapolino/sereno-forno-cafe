# Vídeos do hero (HyperFrames · direção B)

Duas composições de 9 s em loop sem emenda, só imagem e luz (o relógio e o texto são HTML na página, sincronizados com o tempo do vídeo):

- `sereno-madrugada/` 1920×1080 (desktop)
- `sereno-madrugada-vertical/` 1080×1920 (celular)

Imagens: hero-cestos, hero-forno e hero-fornada (ChatGPT, `assets-src/ia/`) e, na cena do forno, o trecho 0–3,7 s do vídeo do Google Flow/Veo (`assets-src/ia/video/flow-forno-16x9.mp4`), sem áudio, espelhado no 16:9 e recortado no arco do forno no 9:16. Se esses arquivos não existirem, o gerador volta às fotos de banco.

Cenas: 0 s cestos de fermentação (03:40) · 3 s forno a lenha (04:30) · 6 s croissant com farinha caindo (06:00) · 8,3–9 s fusão de volta ao início. Poeira de farinha gerada com semente fixa (mulberry32), período exato de 9 s; fusões com brilho de brasa.

```powershell
node video/gerar-composicoes.mjs                     # escreve as duas pastas no Estúdio Criativo (e uma cópia aqui)
. X:\Projetos\estudio-criativo\ambiente.ps1
cd X:\Projetos\estudio-criativo\hyperframes\sereno-madrugada ; hf lint ; hf inspect --samples 10 ; hf render --quality standard -o renders\final.mp4
cd ..\sereno-madrugada-vertical ; hf lint ; hf render --quality standard -o renders\final.mp4
```

Versões para a web em `public/video/` (ffmpeg): 16:9 em 1600 px (MP4 H.264 CRF 28 ≈ 1,5 MB; WebM VP9 CRF 41 ≈ 1,3 MB), 9:16 em 720 px (MP4 ≈ 1,3 MB; WebM ≈ 1,2 MB) e pôsteres do 1º quadro em AVIF/WebP (o pôster é o LCP; o vídeo só carrega depois da abertura).
