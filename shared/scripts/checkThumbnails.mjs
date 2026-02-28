import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('shared/games.json', 'utf8'));
const games = data.studios.flatMap(s => s.games);
let broken = [];
for (const g of games) {
  try {
    const r = await fetch(g.thumbnail, { method: 'HEAD', redirect: 'follow' });
    if (!r.ok) broken.push(`${g.id} (${r.status})`);
  } catch(e) {
    broken.push(`${g.id} (ERR: ${e.message})`);
  }
}
console.log(`Total: ${games.length} | Broken: ${broken.length}`);
if (broken.length) console.log(broken.join('\n'));
else console.log('ALL THUMBNAILS OK');
