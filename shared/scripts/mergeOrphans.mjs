/**
 * Merge orphan Supabase videos into defaultVideos.json
 * Fetches all active videos from Supabase, adds any missing from bundled JSON.
 */
import { readFileSync, writeFileSync } from 'fs';

const SUPABASE_URL = 'https://ydnvwpiiwocnebpbtfly.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_KEY;

const bundled = JSON.parse(readFileSync('shared/defaultVideos.json', 'utf8'));
const bundledPexelsIds = new Set(bundled.map(v => v.pexels_id));

// Fetch all videos from Supabase
const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*&is_active=eq.true&limit=500`, {
  headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` },
});
const all = await res.json();

const orphans = all.filter(v => !bundledPexelsIds.has(v.pexels_id));
console.log(`Bundled: ${bundled.length}, Supabase: ${all.length}, Orphans to add: ${orphans.length}`);

for (const v of orphans) {
  bundled.push({
    id: v.id,
    pexels_id: v.pexels_id,
    title: v.title,
    description: v.description || '',
    theme: v.theme,
    video_url: v.video_url,
    thumbnail_url: v.thumbnail_url,
    duration: v.duration || 0,
    photographer: v.photographer || '',
    photographer_url: v.photographer_url || '',
    width: v.width || 0,
    height: v.height || 0,
    like_count: v.like_count || 0,
    comment_count: v.comment_count || 0,
    view_count: v.view_count || 0,
    is_active: true,
    created_at: v.created_at || new Date().toISOString(),
  });
}

// Sort by theme
const THEMES = [
  'nature','sports','technology','city','food','ocean','space','dance',
  'animals','music','travel','fitness','fashion','winter','sunset',
  'underwater','architecture','adventure','festival','abstract',
];
bundled.sort((a, b) => {
  const ti = THEMES.indexOf(a.theme);
  const tj = THEMES.indexOf(b.theme);
  if (ti !== tj) return (ti === -1 ? 999 : ti) - (tj === -1 ? 999 : tj);
  return a.pexels_id - b.pexels_id;
});

writeFileSync('shared/defaultVideos.json', JSON.stringify(bundled, null, 2));

// Count per theme
const counts = {};
bundled.forEach(v => { counts[v.theme] = (counts[v.theme] || 0) + 1; });
console.log(`\nTotal: ${bundled.length}`);
Object.entries(counts).sort((a, b) => THEMES.indexOf(a[0]) - THEMES.indexOf(b[0]))
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
