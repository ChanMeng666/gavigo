// Pure derivation functions for game data — no runtime dependencies
// Used by both mobile and frontend to derive views from shared/games.json

export interface GameEntry {
  id: string;
  title: string;
  emoji: string;
  thumbnail: string;
  url: string;
  theme: string;
  description: string;
  supabase_id?: string;
}

export interface StudioEntry {
  name: string;
  emoji: string;
  tagline: string;
  accentColor: string;
  games: GameEntry[];
}

export interface GamesData {
  studios: StudioEntry[];
  crossDomainRelations: Record<string, string>;
}

export interface StudioGame {
  id: string;
  title: string;
  emoji: string;
  thumbnail: string;
}

export interface Studio {
  name: string;
  emoji: string;
  tagline: string;
  accentColor: string;
  games: StudioGame[];
}

/** Build a flat id→url map from all studios */
export function buildGameUrlMap(data: GamesData): Record<string, string> {
  const map: Record<string, string> = {};
  for (const studio of data.studios) {
    for (const game of studio.games) {
      map[game.id] = game.url;
    }
  }
  return map;
}

/** Build Studio[] for UI display (strips url/theme/description) */
export function buildStudios(data: GamesData): Studio[] {
  return data.studios.map((s) => ({
    name: s.name,
    emoji: s.emoji,
    tagline: s.tagline,
    accentColor: s.accentColor,
    games: s.games.map((g) => ({
      id: g.id,
      title: g.title,
      emoji: g.emoji,
      thumbnail: g.thumbnail,
    })),
  }));
}

/** Flatten all games across all studios */
export function buildAllGames(data: GamesData): StudioGame[] {
  return data.studios.flatMap((s) =>
    s.games.map((g) => ({
      id: g.id,
      title: g.title,
      emoji: g.emoji,
      thumbnail: g.thumbnail,
    }))
  );
}

/** Build a game slug → Supabase UUID map for social features */
export function buildGameSupabaseIdMap(data: GamesData): Record<string, string> {
  const map: Record<string, string> = {};
  for (const studio of data.studios) {
    for (const game of studio.games) {
      if (game.supabase_id) {
        map[game.id] = game.supabase_id;
      }
    }
  }
  return map;
}
