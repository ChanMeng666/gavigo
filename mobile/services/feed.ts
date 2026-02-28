import { supabase } from './supabase';
import type { Video } from '@/types/supabase';

const PAGE_SIZE = 15;

export async function fetchFeed(
  page = 1,
  pageSize = PAGE_SIZE
): Promise<Video[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .eq('content_type', 'video')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function fetchTrendingFeed(
  page = 1,
  pageSize = PAGE_SIZE
): Promise<Video[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .eq('content_type', 'video')
    .order('like_count', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function fetchVideosByTheme(
  theme: string,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<Video[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .eq('content_type', 'video')
    .eq('theme', theme)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function fetchVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function searchVideos(
  query: string,
  page = 1,
  pageSize = PAGE_SIZE
): Promise<Video[]> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_active', true)
    .eq('content_type', 'video')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,photographer.ilike.%${query}%`)
    .order('like_count', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}
