// Grava a origem de cada raster publicado dentro do próprio arquivo (impeccable embed-prompt),
// para que toda imagem carregue sua proveniência. Uso: node scripts/proveniencia.mjs
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const CLI = 'C:/Users/chapo/.claude/skills/impeccable/scripts/impeccable.cmd';
const fotos = Object.fromEntries(JSON.parse(await readFile('scripts/fotos.json', 'utf8')).map((f) => [f.nome, f]));
const origem = (arq) => {
  if (!/\.(webp|avif|png|jpe?g)$/i.test(arq)) return null; // só imagens, nunca as próprias fichas .json
  const nome = arq.replace(/-(480|800|1200|1600|2400)\.(webp|avif)$/, '');
  if (nome.startsWith('ia-')) return `Imagem gerada por IA (ChatGPT, 03/10/2026) a partir do prompt '${nome.slice(3)}' de docs/direcoes/prompts-ia-B.md (direção B, clave baixa). Ilustração, não é foto real. Redimensionada por scripts/otimizar-imagens.mjs.`;
  if (fotos[nome]) {
    const f = fotos[nome];
    return `Foto de banco: Unsplash https://unsplash.com/photos/${f.id} por ${f.autor} (Licença Unsplash). Redimensionada e com o tratamento de cor quente da Sereno (scripts/otimizar-imagens.mjs). Sem IA.`;
  }
  if (arq.startsWith('madrugada-')) return 'Primeiro quadro do vídeo HyperFrames do hero (video/sereno-madrugada*), montado com imagens geradas por IA (ChatGPT: hero-cestos, hero-forno, hero-fornada) e um trecho de vídeo do Google Flow/Veo.';
  if (arq === 'og.jpg') return 'Captura do hero da própria página (scripts/icones.mjs, Playwright), com o pôster do vídeo HyperFrames (imagem de IA).';
  if (/icon|favicon|apple-touch/.test(arq)) return 'Ícone "S" em Libre Caslon Display renderizado por scripts/icones.mjs. Sem IA.';
  return null;
};
const alvos = [
  ...(await readdir('public/img')).map((a) => ['public/img', a]),
  ...(await readdir('public/video')).filter((a) => /\.(webp|png|jpg)$/.test(a)).map((a) => ['public/video', a]),
  ...(await readdir('public')).filter((a) => /\.(png|jpg)$/.test(a)).map((a) => ['public', a]),
];
let ok = 0;
await mkdir('docs/_tmp', { recursive: true });
const tmp = 'docs/_tmp/origem.txt';
for (const [dir, arq] of alvos) {
  const o = origem(arq);
  if (!o) continue;
  try {
    await writeFile(tmp, o);
    execFileSync(CLI, ['embed-prompt', join(dir, arq), '--prompt-file', tmp], { stdio: 'pipe', shell: true });
    ok++;
  } catch (e) {
    // formatos sem suporte a metadados (ex.: AVIF) ficam registrados só no CREDITOS.md
  }
}
console.log('proveniência gravada em', ok, 'arquivos');
