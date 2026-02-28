import gamesData from '../../shared/games.json';
import { buildGameUrlMap, buildStudios, buildAllGames } from '../../shared/gameHelpers';
import type { Studio, StudioGame } from '../../shared/gameHelpers';

export type { Studio, StudioGame };

export const gameUrlMap: Record<string, string> = buildGameUrlMap(gamesData);
export const STUDIOS: Studio[] = buildStudios(gamesData);
export const ALL_GAMES: StudioGame[] = buildAllGames(gamesData);
