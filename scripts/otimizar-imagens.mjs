// Gera AVIF + WebP responsivos em public/img/ a partir de assets-src/fotos/*.jpg (banco) e assets-src/ia/* (imagens próprias por IA),
// com a mesma correção de cor quente em todas (casca, miolo, forno no mesmo tom).
// Também grava scripts/dimensoes.json (largura/altura dos originais) para o build pôr width/height.
// Requer ffmpeg no PATH (libaom-av1 + libwebp). Uso: node scripts/otimizar-imagens.mjs [nome ...]
import { readdir, mkdir, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const FONTES = ['assets-src/fotos', 'assets-src/ia'];
const out = 'public/img';
await mkdir(out, { recursive: true });
export const LARGURAS = [480, 800, 1200, 1600, 2400];
// Tratamento quente e consistente: sombras levemente âmbar, azuis contidos, contraste suave
const GRADE =
  'colorbalance=rs=0.07:gs=0.015:bs=-0.07:rm=0.05:bm=-0.05:rh=0.025:bh=-0.035,eq=contrast=1.05:saturation=0.88:gamma=0.97';

const so = process.argv.slice(2);
const dimArq = 'scripts/dimensoes.json';
let dims = {};
try {
  dims = JSON.parse(await readFile(dimArq, 'utf8'));
} catch {}

const entradas = [];
for (const dir of FONTES) {
  let arqs = [];
  try {
    arqs = await readdir(dir);
  } catch {}
  // as versões 16:9 do hero (hero-*-16x9) vão só para o vídeo; as 9:16 também servem de foto vertical nas seções
  for (const a of arqs.filter((x) => /\.(jpe?g|png|webp)$/i.test(x) && !/^hero-.*-16x9\./.test(x))) entradas.push([dir, a]);
}
for (const [src, arq] of entradas) {
  // imagens próprias por IA ganham o prefixo ia- (não se misturam com as fotos de banco de mesmo nome)
  const ia = src.endsWith('/ia');
  const nome = (ia ? 'ia-' : '') + arq.replace(/\.(jpe?g|png|webp)$/i, '');
  const [w0, h0] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', join(src, arq)])
    .toString()
    .trim()
    .split(',')
    .map(Number);
  dims[nome] = [w0, h0];
  if (so.length && !so.includes(nome)) continue;
  for (const w of LARGURAS) {
    const base = join(out, `${nome}-${w}`);
    // as de IA já nascem na paleta B: só redimensiona
    const vf = `scale=${Math.min(w, w0)}:-2:flags=lanczos${ia ? '' : ',' + GRADE}`;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(src, arq), '-vf', vf,
      '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', w >= 1600 ? '36' : '33', '-cpu-used', '6', '-pix_fmt', 'yuv420p', `${base}.avif`]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(src, arq), '-vf', vf,
      '-c:v', 'libwebp', '-quality', w >= 1600 ? '70' : '74', '-compression_level', '6', `${base}.webp`]);
  }
  console.log(nome, 'ok');
}
await writeFile(dimArq, JSON.stringify(dims, null, 2) + '\n');
