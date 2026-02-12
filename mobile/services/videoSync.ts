import { supabase } from './supabase';
import { searchVideos, pickBestVideoFile } from './pexels';

const THEMES = [
  'nature',
  'sports',
  'technology',
  'city',
  'food',
  'ocean',
  'space',
  'dance',
];

const VIDEOS_PER_THEME = 8;
const MIN_VIDEOS_THRESHOLD = 50;

export async function syncVideosFromPexels(
  options: { force?: boolean } = {}
): Promise<number> {
  // Check existing video count
  if (!options.force) {
    const { count } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (count && count >= MIN_VIDEOS_THRESHOLD) {
      return 0;
    }
  }

  let totalInserted = 0;

  for (const theme of THEMES) {
    try {
      const pexelsVideos = await searchVideos(theme, 1, VIDEOS_PER_THEME);

      const rows = pexelsVideos
        .map((v) => {
          const file = pickBestVideoFile(v.video_files);
          if (!file) return null;

          return {
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
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (rows.length > 0) {
        const { data } = await supabase
          .from('videos')
          .upsert(rows, { onConflict: 'pexels_id' })
          .select();

        totalInserted += data?.length ?? 0;
      }
    } catch (err) {
      console.warn(`Failed to sync theme "${theme}":`, err);
    }
  }

  return totalInserted;
}
