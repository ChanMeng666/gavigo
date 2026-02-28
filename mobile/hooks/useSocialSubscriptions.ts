import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useSocialStore } from '@/stores/socialStore';
import { getComments } from '@/services/social';

export function useSocialSubscriptions(contentId: string | null) {
  const setLikeCount = useSocialStore((s) => s.setLikeCount);
  const setComments = useSocialStore((s) => s.setComments);

  useEffect(() => {
    if (!contentId) return;

    const channel = supabase
      .channel(`social-${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `content_id=eq.${contentId}`,
        },
        async () => {
          // Re-fetch like count
          const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', contentId);
          setLikeCount(contentId, count ?? 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `content_id=eq.${contentId}`,
        },
        async () => {
          // Re-fetch comments with profile info
          try {
            const comments = await getComments(contentId);
            setComments(
              contentId,
              comments.map((c) => ({
                id: c.id,
                user_id: c.user_id,
                content_id: c.content_id,
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
  }, [contentId, setLikeCount, setComments]);
}
