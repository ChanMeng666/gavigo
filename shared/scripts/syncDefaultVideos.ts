/**
 * Sync default videos from Pexels API and write to shared/defaultVideos.json
 *
 * Usage: PEXELS_API_KEY=<key> npx tsx shared/scripts/syncDefaultVideos.ts
 *
 * This generates a bundled set of ~50 videos that ship with the app,
 * ensuring the feed renders instantly on first launch with no network.
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

const VIDEOS_PER_THEME = 3;

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
  // Prefer HD mp4, vertical or square aspect ratio
  const mp4s = files.filter((f) => f.file_type === 'video/mp4');
  const hd = mp4s.filter((f) => f.quality === 'hd' && f.height >= 720);
  const sd = mp4s.filter((f) => f.quality === 'sd');
  return hd[0] ?? sd[0] ?? mp4s[0] ?? null;
}

async function fetchPexelsVideos(query: string, perPage: number): Promise<PexelsVideo[]> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY! },
  });
  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.videos ?? [];
}

async function main() {
  const allVideos: DefaultVideo[] = [];
  const now = new Date().toISOString();

  for (const theme of THEMES) {
    console.log(`Fetching ${VIDEOS_PER_THEME} videos for theme: ${theme}`);
    try {
      const videos = await fetchPexelsVideos(theme, VIDEOS_PER_THEME);

      for (const v of videos) {
        const file = pickBestVideoFile(v.video_files);
        if (!file) continue;

        allVideos.push({
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
        });
      }

      // Rate limit: 200 requests/hour = ~1 request per 18s, but be safe
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`Failed to fetch theme "${theme}":`, err);
    }
  }

  const outPath = path.resolve(__dirname, '../defaultVideos.json');
  fs.writeFileSync(outPath, JSON.stringify(allVideos, null, 2));
  console.log(`\nWrote ${allVideos.length} videos to ${outPath}`);
}

main().catch(console.error);
