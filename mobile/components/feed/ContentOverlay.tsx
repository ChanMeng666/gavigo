import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentButton } from '@/components/social/CommentButton';
import { ShareButton } from '@/components/social/ShareButton';
import { FollowButton } from '@/components/social/FollowButton';
import { Avatar, Badge, Chip } from '@/components/ui';
import { getEngagementCounts } from '@/services/social';
import { useSocialStore } from '@/stores/socialStore';
import type { ContentItem, ContainerStatus } from '@/types';

interface ContentOverlayProps {
  item: ContentItem;
  containerStatus: ContainerStatus;
}

export function ContentOverlay({ item, containerStatus }: ContentOverlayProps) {
  const initLikeCount = useSocialStore((s) => s.initLikeCount);
  const initCommentCount = useSocialStore((s) => s.initCommentCount);
  const likeCount = useSocialStore((s) => s.likeCounts[item.id] ?? 0);
  const commentCount = useSocialStore((s) => s.commentCounts[item.id] ?? 0);

  useEffect(() => {
    getEngagementCounts(item.id).then(({ likes, comments }) => {
      initLikeCount(item.id, likes);
      initCommentCount(item.id, comments);
    }).catch(() => {});
  }, [item.id, initLikeCount, initCommentCount]);

  return (
    <>
      {/* Bottom gradient scrim for text readability */}
      <View
        className="absolute bottom-0 left-0 right-0"
        pointerEvents="none"
        style={{
          height: 350,
          // @ts-ignore — backgroundImage is valid on web via RN Web
          backgroundImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.03) 20%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.75) 85%, rgba(0,0,0,0.9) 100%)',
        }}
      />

      {/* Bottom info overlay */}
      <View
        className="absolute bottom-0 left-0 right-14 p-4"
        pointerEvents="box-none"
      >
        {/* Creator info */}
        <View className="flex-row items-center gap-2 mb-2">
          <Avatar name={item.theme} size="sm" />
          <Text className="text-body font-semibold text-text-primary">
            @gavigo_{item.theme}
          </Text>
          <FollowButton userId={`gavigo_${item.theme}`} compact />
        </View>

        {/* Title and description */}
        <Text className="text-h3 text-text-primary mb-1" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-caption text-text-primary/70 mb-2" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-1.5">
          <Chip label={`#${item.theme}`} compact />
          <Chip label={`#${item.type.toLowerCase()}`} compact />
          <Chip label="#gavigo" compact />
        </View>
      </View>

      {/* Right-side action buttons */}
      <View className="absolute right-2 bottom-32 items-center gap-5">
        <LikeButton contentId={item.id} initialCount={likeCount} />
        <CommentButton contentId={item.id} initialCount={commentCount} />
        <ShareButton contentId={item.id} title={item.title} />
      </View>

      {/* Container status badge */}
      <View className="absolute top-4 right-3" pointerEvents="none">
        <Badge status={containerStatus} />
      </View>
    </>
  );
}
