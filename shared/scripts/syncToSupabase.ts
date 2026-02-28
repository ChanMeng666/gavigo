/**
 * Sync bundled defaultVideos.json → Supabase videos table
 * Then update defaultVideos.json with Supabase UUIDs
 *
 * Usage: npx tsx shared/scripts/syncToSupabase.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://ydnvwpiiwocnebpbtfly.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const VIDEOS_PATH = path.resolve(__dirname, '../defaultVideos.json');

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

interface SupabaseVideo {
  id: string; // UUID
  pexels_id: number;
  title: string;
  theme: string;
}

async function supabaseRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY!,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });
}

async function main() {
  // Load bundled videos
  const videos: DefaultVideo[] = JSON.parse(fs.readFileSync(VIDEOS_PATH, 'utf-8'));
  console.log(`Loaded ${videos.length} bundled videos`);

  // Fetch existing videos from Supabase to check what's already there
  const existingRes = await supabaseRequest('/videos?select=id,pexels_id&limit=1000');
  if (!existingRes.ok) {
    console.error('Failed to fetch existing videos:', await existingRes.text());
    process.exit(1);
  }
  const existing: SupabaseVideo[] = await existingRes.json();
  const existingMap = new Map(existing.map((v) => [v.pexels_id, v.id]));
  console.log(`Found ${existing.length} existing videos in Supabase`);

  // Separate into new vs existing
  const toInsert = videos.filter((v) => !existingMap.has(v.pexels_id));
  const alreadyExist = videos.filter((v) => existingMap.has(v.pexels_id));
  console.log(`  Already in Supabase: ${alreadyExist.length}`);
  console.log(`  New to insert: ${toInsert.length}`);

  // Batch upsert in chunks of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  const newIdMap = new Map<number, string>(); // pexels_id → UUID

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const rows = batch.map((v) => ({
      pexels_id: v.pexels_id,
      title: v.title,
      description: v.description,
      theme: v.theme,
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url,
      duration: v.duration,
      photographer: v.photographer,
      photographer_url: v.photographer_url,
      width: v.width,
      height: v.height,
    }));

    const res = await supabaseRequest('/videos', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, errText);
      continue;
    }

    const data: SupabaseVideo[] = await res.json();
    for (const row of data) {
      newIdMap.set(row.pexels_id, row.id);
    }
    inserted += data.length;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${data.length} videos`);
  }

  console.log(`\nTotal inserted: ${inserted}`);

  // Build complete pexels_id → UUID map
  for (const [pexelsId, uuid] of existingMap) {
    newIdMap.set(pexelsId, uuid);
  }

  // Update defaultVideos.json with Supabase UUIDs
  let updated = 0;
  for (const v of videos) {
    const uuid = newIdMap.get(v.pexels_id);
    if (uuid && v.id !== uuid) {
      v.id = uuid;
      updated++;
    }
  }

  fs.writeFileSync(VIDEOS_PATH, JSON.stringify(videos, null, 2));
  console.log(`Updated ${updated} video IDs in defaultVideos.json`);

  // Verify final count
  const verifyRes = await supabaseRequest('/videos?select=id&is_active=eq.true&limit=1', {
    headers: { 'Prefer': 'count=exact' },
  });
  const countHeader = verifyRes.headers.get('content-range');
  console.log(`\nSupabase videos total: ${countHeader}`);
}

main().catch(console.error);
