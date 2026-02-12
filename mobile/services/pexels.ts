const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY || '';
const BASE_URL = 'https://api.pexels.com';

interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

interface PexelsSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

async function pexelsFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: PEXELS_API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }
  return response.json();
}

export async function searchVideos(
  query: string,
  page = 1,
  perPage = 8,
  orientation: 'portrait' | 'landscape' | 'square' = 'portrait'
): Promise<PexelsVideo[]> {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString(),
    orientation,
  });
  const data = await pexelsFetch<PexelsSearchResponse>(
    `/videos/search?${params}`
  );
  return data.videos;
}

export async function getPopularVideos(
  page = 1,
  perPage = 8
): Promise<PexelsVideo[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });
  const data = await pexelsFetch<PexelsSearchResponse>(
    `/videos/popular?${params}`
  );
  return data.videos;
}

export function pickBestVideoFile(
  files: PexelsVideoFile[]
): PexelsVideoFile | null {
  // Prefer HD mp4, then SD mp4
  const mp4Files = files.filter((f) => f.file_type === 'video/mp4');
  const hd = mp4Files.find((f) => f.quality === 'hd');
  if (hd) return hd;
  const sd = mp4Files.find((f) => f.quality === 'sd');
  if (sd) return sd;
  return mp4Files[0] || files[0] || null;
}

export type { PexelsVideo, PexelsVideoFile };
