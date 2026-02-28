/**
 * Fetch missing CrazyGames thumbnails and update games.json
 * Usage: npx tsx shared/scripts/fetchThumbnails.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const GAMES_PATH = path.resolve(__dirname, '../games.json');

interface GameEntry {
  id: string;
  title: string;
  emoji: string;
  thumbnail: string;
  url: string;
  theme: string;
  description: string;
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

function extractSlug(gameUrl: string): string {
  // https://games.crazygames.com/en_US/chess-free/index.html → chess-free
  const match = gameUrl.match(/\/en_US\/([^/]+)\//);
  return match ? match[1] : '';
}

async function fetchOgImage(slug: string): Promise<string | null> {
  try {
    const url = `https://www.crazygames.com/game/${slug}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    // Extract og:image
    const ogMatch = html.match(/og:image["']\s+content=["']([^"']+)/);
    if (ogMatch) {
      // Convert to 1x1 cover at 400px width for thumbnail use
      let imgUrl = ogMatch[1].replace(/&amp;/g, '&');
      // Replace 16x9 with 1x1 for square thumbnails
      imgUrl = imgUrl.replace(/_16x9/g, '_1x1');
      // Adjust dimensions for thumbnail
      imgUrl = imgUrl.replace(/width=\d+/, 'width=400');
      imgUrl = imgUrl.replace(/&height=\d+/, '');
      imgUrl = imgUrl.replace(/&fit=crop/, '');
      return imgUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const data: GamesData = JSON.parse(fs.readFileSync(GAMES_PATH, 'utf-8'));

  let missingCount = 0;
  let updatedCount = 0;
  let failedIds: string[] = [];

  for (const studio of data.studios) {
    for (const game of studio.games) {
      if (game.thumbnail) continue; // Already has thumbnail
      missingCount++;

      const slug = extractSlug(game.url);
      if (!slug) {
        console.log(`  SKIP: ${game.id} — no slug from URL`);
        failedIds.push(game.id);
        continue;
      }

      console.log(`Fetching: ${game.id} (slug: ${slug})...`);
      const imgUrl = await fetchOgImage(slug);
      if (imgUrl) {
        game.thumbnail = imgUrl;
        updatedCount++;
        console.log(`  OK: ${game.title}`);
      } else {
        console.log(`  FAIL: ${game.title}`);
        failedIds.push(game.id);
      }

      // Rate limit: 200ms between requests
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  fs.writeFileSync(GAMES_PATH, JSON.stringify(data, null, 2));
  console.log(`\nDone! ${updatedCount}/${missingCount} thumbnails updated.`);
  if (failedIds.length > 0) {
    console.log(`Failed: ${failedIds.join(', ')}`);
  }
}

main();
