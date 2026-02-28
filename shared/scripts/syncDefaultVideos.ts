/**
 * Sync default videos from Pexels API and write to shared/defaultVideos.json
 *
 * Usage: PEXELS_API_KEY=<key> npx tsx shared/scripts/syncDefaultVideos.ts
 *
 * Incrementally adds videos: keeps existing entries, only fetches missing ones.
 * Target: 8 videos per theme × 20 themes = 160 total.
 */

import * as fs from 'fs';
import * as path from 'path';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
  console.error('Error: PEXELS_API_KEY environment variable is required');
  process.exit(1);
}

const THEMES = [
  'nature', 'sports', 'technology', 'city', 'food',
  'ocean', 'space', 'dance', 'animals', 'music',
  'travel', 'fitness', 'fashion', 'winter', 'sunset',
  'underwater', 'architecture', 'adventure', 'festival', 'abstract',
];

const VIDEOS_PER_THEME = 8;

interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  user: { name: string; url: string };
  video_files: PexelsVideoFile[];
}

interface DefaultVideo {
  id: string;
  pexels_id: number;
  title: string;
  description: string;
  theme: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  photographer: string;
  photographer_url: string;
  width: number;
  height: number;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
}

function pickBestVideoFile(files: PexelsVideoFile[]): PexelsVideoFile | null {
  const mp4s = files.filter((f) => f.file_type === 'video/mp4');
  const hd = mp4s.filter((f) => f.quality === 'hd' && f.height >= 720);
  const sd = mp4s.filter((f) => f.quality === 'sd');
  return hd[0] ?? sd[0] ?? mp4s[0] ?? null;
}

async function fetchPexelsVideos(query: string, perPage: number, page = 1): Promise<PexelsVideo[]> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY! },
  });
  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.videos ?? [];
}

function toDefaultVideo(v: PexelsVideo, theme: string, file: PexelsVideoFile, now: string): DefaultVideo {
  return {
    id: `pexels-${theme}-${v.id}`,
    pexels_id: v.id,
    title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} - ${v.user.name}`,
    description: `${theme} video by ${v.user.name}`,
    theme,
    video_url: file.link,
    thumbnail_url: v.image,
    duration: v.duration,
    photographer: v.user.name,
    photographer_url: v.user.url,
    width: file.width,
    height: file.height,
    like_count: 0,
    comment_count: 0,
    view_count: 0,
    is_active: true,
    created_at: now,
  };
}

async function main() {
  const outPath = path.resolve(__dirname, '../defaultVideos.json');

  // Load existing videos
  let existing: DefaultVideo[] = [];
  try {
    existing = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    console.log(`Loaded ${existing.length} existing videos`);
  } catch {
    console.log('No existing defaultVideos.json, starting fresh');
  }

  // Index existing by pexels_id for deduplication
  const seenPexelsIds = new Set(existing.map((v) => v.pexels_id));

  // Count existing per theme
  const themeCount: Record<string, number> = {};
  for (const theme of THEMES) themeCount[theme] = 0;
  for (const v of existing) {
    if (themeCount[v.theme] !== undefined) themeCount[v.theme]++;
  }

  const now = new Date().toISOString();
  let added = 0;

  for (const theme of THEMES) {
    const have = themeCount[theme];
    const need = VIDEOS_PER_THEME - have;
    if (need <= 0) {
      console.log(`  ${theme}: already has ${have}/${VIDEOS_PER_THEME}, skip`);
      continue;
    }

    console.log(`  ${theme}: has ${have}, need ${need} more`);

    // Fetch extra to account for duplicates/failures; try up to 2 pages
    let collected = 0;
    for (let page = 1; page <= 3 && collected < need; page++) {
      try {
        const videos = await fetchPexelsVideos(theme, 15, page);
        for (const v of videos) {
          if (collected >= need) break;
          if (seenPexelsIds.has(v.id)) continue;

          const file = pickBestVideoFile(v.video_files);
          if (!file) continue;

          existing.push(toDefaultVideo(v, theme, file, now));
          seenPexelsIds.add(v.id);
          collected++;
          added++;
        }
      } catch (err) {
        console.warn(`    Failed page ${page} for "${theme}":`, err);
      }

      // Rate limit: ~200ms between requests
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`    +${collected} videos (total: ${themeCount[theme] + collected}/${VIDEOS_PER_THEME})`);
  }

  // Sort by theme for clean output
  existing.sort((a, b) => {
    const ti = THEMES.indexOf(a.theme);
    const tj = THEMES.indexOf(b.theme);
    if (ti !== tj) return ti - tj;
    return a.pexels_id - b.pexels_id;
  });

  fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
  console.log(`\nDone! Added ${added} new videos. Total: ${existing.length}`);
}

main().catch(console.error);
