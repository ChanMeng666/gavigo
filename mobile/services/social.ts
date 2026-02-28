import { supabase } from './supabase';
import { useAuthStore } from '@/stores/authStore';

function getUserId(): string {
  return useAuthStore.getState().firebaseUid || '';
}

export async function toggleLike(
  contentId: string
): Promise<{ liked: boolean; count: number }> {
  const userId = getUserId();

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    // Like
    await supabase.from('likes').insert({ user_id: userId, content_id: contentId });
  }

  // Get updated count
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId);

  return { liked: !existing, count: count ?? 0 };
}

export async function isLiked(contentId: string): Promise<boolean> {
  const userId = getUserId();
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .maybeSingle();
  return !!data;
}

export async function getComments(
  contentId: string
): Promise<
  {
    id: string;
    user_id: string;
    content_id: string;
    text: string;
    username: string;
    avatar_url: string | null;
    created_at: string;
  }[]
> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, content_id, text, created_at, profiles!inner(username, avatar_url)')
    .eq('content_id', contentId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    content_id: c.content_id,
    text: c.text,
    username: c.profiles?.username ?? 'user',
    avatar_url: c.profiles?.avatar_url ?? null,
    created_at: c.created_at,
  }));
}

export async function postComment(
  contentId: string,
  text: string
): Promise<{ id: string }> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, content_id: contentId, text })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function toggleFollow(
  targetUserId: string
): Promise<{ following: boolean }> {
  const userId = getUserId();

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    return { following: false };
  } else {
    await supabase
      .from('follows')
      .insert({ follower_id: userId, following_id: targetUserId });
    return { following: true };
  }
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const userId = getUserId();
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', userId)
    .eq('following_id', targetUserId)
    .maybeSingle();
  return !!data;
}
