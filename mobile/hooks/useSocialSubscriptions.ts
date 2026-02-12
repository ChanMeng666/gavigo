import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useSocialStore } from '@/stores/socialStore';
import { getComments } from '@/services/social';

export function useSocialSubscriptions(videoId: string | null) {
  const setLikeCount = useSocialStore((s) => s.setLikeCount);
  const setComments = useSocialStore((s) => s.setComments);

  useEffect(() => {
    if (!videoId) return;

    const channel = supabase
      .channel(`social-${videoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `video_id=eq.${videoId}`,
        },
        async () => {
          // Re-fetch like count
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('video_id', videoId);
          setLikeCount(videoId, count ?? 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`,
        },
        async () => {
          // Re-fetch comments with profile info
          try {
            const comments = await getComments(videoId);
            setComments(
              videoId,
              comments.map((c) => ({
                id: c.id,
                user_id: c.user_id,
                content_id: c.video_id,
                text: c.text,
                username: c.username,
                avatar_url: c.avatar_url,
                created_at: c.created_at,
              }))
            );
          } catch {
            // Ignore
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, setLikeCount, setComments]);
}
