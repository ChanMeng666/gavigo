import gamesData from '../../shared/games.json';
import { buildGameUrlMap, buildStudios, buildAllGames, buildAllGameEntries, buildGameSupabaseIdMap } from '../../shared/gameHelpers';
import type { Studio, StudioGame, GameEntry } from '../../shared/gameHelpers';

export type { Studio, StudioGame, GameEntry };

export const gameUrlMap: Record<string, string> = buildGameUrlMap(gamesData);
export const STUDIOS: Studio[] = buildStudios(gamesData);
export const ALL_GAMES: StudioGame[] = buildAllGames(gamesData);
export const ALL_GAME_ENTRIES: GameEntry[] = buildAllGameEntries(gamesData);
export const gameSupabaseIdMap: Record<string, string> = buildGameSupabaseIdMap(gamesData);
