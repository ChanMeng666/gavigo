import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://ydnvwpiiwocnebpbtfly.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_KEY;

const bundled = JSON.parse(readFileSync('shared/defaultVideos.json', 'utf8'));
const bundledPexelsIds = new Set(bundled.map(v => v.pexels_id));

const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=id,pexels_id,title,theme&is_active=eq.true&limit=500`, {
  headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` },
});
const all = await res.json();

const orphans = all.filter(v => !bundledPexelsIds.has(v.pexels_id));

console.log('Supabase total:', all.length);
console.log('Bundled total:', bundled.length);
console.log('Overlap:', all.length - orphans.length);
console.log('Orphans (Supabase only):', orphans.length);
console.log('\nOrphan videos:');
orphans.forEach(v => console.log(`  [${v.theme}] ${v.title} (pexels_id: ${v.pexels_id})`));
