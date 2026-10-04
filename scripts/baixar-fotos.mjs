// Baixa as fotos originais (Unsplash License) listadas em scripts/fotos.json para assets-src/fotos/.
// Uso: node scripts/baixar-fotos.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const fotos = JSON.parse(await readFile(new URL('./fotos.json', import.meta.url)));
await mkdir(new URL('../assets-src/fotos/', import.meta.url), { recursive: true });
for (const f of fotos) {
  const r = await fetch(`https://unsplash.com/photos/${f.id}/download?force=true&w=2400`);
  if (!r.ok) throw new Error(`${f.nome}: HTTP ${r.status}`);
  await writeFile(new URL(`../assets-src/fotos/${f.nome}.jpg`, import.meta.url), Buffer.from(await r.arrayBuffer()));
  console.log('ok', f.nome);
}
