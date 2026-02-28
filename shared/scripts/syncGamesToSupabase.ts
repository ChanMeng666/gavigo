/**
 * Sync 80 games from shared/games.json → Supabase videos table (content_type='game')
 * Then update games.json with Supabase UUIDs in a `supabase_id` field per game.
 *
 * Prerequisites: Run migration 002_unified_content.sql first.
 *
 * Usage: SUPABASE_SERVICE_KEY=<key> npx tsx shared/scripts/syncGamesToSupabase.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://ydnvwpiiwocnebpbtfly.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const GAMES_PATH = path.resolve(__dirname, '../games.json');

interface GameEntry {
  id: string;
  title: string;
  emoji: string;
  thumbnail: string;
  url: string;
  theme: string;
  description: string;
  supabase_id?: string;
}

interface StudioEntry {
  name: string;
  emoji: string;
  tagline: string;
  accentColor: string;
  games: GameEntry[];
}

interface GamesData {
  studios: StudioEntry[];
  crossDomainRelations: Record<string, string>;
}

interface SupabaseRow {
  id: string;
  slug: string;
}

async function supabaseRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  return fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
  });
}

async function main() {
  const gamesData: GamesData = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));

  // Flatten all games
  const allGames: GameEntry[] = gamesData.studios.flatMap((s) => s.games);
  console.log(`Loaded ${allGames.length} games from ${gamesData.studios.length} studios`);

  // Fetch existing game records from Supabase (content_type='game')
  const existingRes = await supabaseRequest(
    '/videos?select=id,slug&content_type=eq.game&limit=1000'
  );
  if (!existingRes.ok) {
    console.error('Failed to fetch existing games:', await existingRes.text());
    process.exit(1);
  }
  const existing: SupabaseRow[] = await existingRes.json();
  const existingMap = new Map(existing.map((r) => [r.slug, r.id]));
  console.log(`Found ${existing.length} existing game records in Supabase`);

  // Separate into new vs existing
  const toInsert = allGames.filter((g) => !existingMap.has(g.id));
  const alreadyExist = allGames.filter((g) => existingMap.has(g.id));
  console.log(`  Already in Supabase: ${alreadyExist.length}`);
  console.log(`  New to insert: ${toInsert.length}`);

  // Batch upsert in chunks of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  const newIdMap = new Map<string, string>(); // game slug → UUID

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const rows = batch.map((g) => ({
      content_type: 'game',
      slug: g.id,
      title: g.title,
      description: g.description,
      theme: g.theme,
      video_url: g.url,
      thumbnail_url: g.thumbnail,
      duration: 0,
      photographer: g.emoji,
      photographer_url: '',
      width: 400,
      height: 400,
    }));

    const res = await supabaseRequest('/videos', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, errText);
      continue;
    }

    const data: SupabaseRow[] = await res.json();
    for (const row of data) {
      newIdMap.set(row.slug, row.id);
    }
    inserted += data.length;
    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${data.length} games`
    );
  }

  console.log(`\nTotal inserted: ${inserted}`);

  // Build complete slug → UUID map
  for (const [slug, uuid] of existingMap) {
    newIdMap.set(slug, uuid);
  }

  // Update games.json with supabase_id per game
  let updated = 0;
  for (const studio of gamesData.studios) {
    for (const game of studio.games) {
      const uuid = newIdMap.get(game.id);
      if (uuid && game.supabase_id !== uuid) {
        game.supabase_id = uuid;
        updated++;
      }
    }
  }

  fs.writeFileSync(GAMES_PATH, JSON.stringify(gamesData, null, 2) + '\n');
  console.log(`Updated ${updated} game supabase_ids in games.json`);

  // Verify
  const verifyRes = await supabaseRequest(
    '/videos?select=id&content_type=eq.game&limit=1',
    { headers: { Prefer: 'count=exact' } }
  );
  const countHeader = verifyRes.headers.get('content-range');
  console.log(`\nSupabase game records total: ${countHeader}`);
}

main().catch(console.error);
