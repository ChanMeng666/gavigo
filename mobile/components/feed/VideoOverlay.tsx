import { View, Text } from 'react-native';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentButton } from '@/components/social/CommentButton';
import { ShareButton } from '@/components/social/ShareButton';
import { FollowButton } from '@/components/social/FollowButton';
import { Avatar, Chip } from '@/components/ui';
import type { Video } from '@/types/supabase';

interface VideoOverlayProps {
  video: Video;
}

export function VideoOverlay({ video }: VideoOverlayProps) {
  return (
    <>
      {/* Bottom gradient scrim for text readability */}
      <View
        className="absolute bottom-0 left-0 right-0"
        pointerEvents="none"
        style={{
          height: 300,
          // @ts-ignore — backgroundImage is valid on web via RN Web
          backgroundImage:
            'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Bottom info overlay */}
      <View
        className="absolute bottom-0 left-0 right-14"
        style={{ paddingHorizontal: 14, paddingBottom: 14 }}
        pointerEvents="box-none"
      >
        {/* Creator info */}
        <View className="flex-row items-center gap-2 mb-1.5">
          <Avatar name={video.photographer} size="sm" />
          <Text className="text-body font-bold text-text-primary">
            @{video.photographer.replace(/\s+/g, '_').toLowerCase()}
          </Text>
          <FollowButton userId={video.photographer} compact />
        </View>

        {/* Title */}
        <Text className="text-body font-semibold text-text-primary mb-0.5" numberOfLines={2}>
          {video.title}
        </Text>

        {/* Description */}
        {video.description ? (
          <Text className="text-caption text-text-primary/60 mb-1.5" numberOfLines={2}>
            {video.description}
          </Text>
        ) : null}

        {/* Tags */}
        <View className="flex-row flex-wrap gap-1">
          <Chip label={`#${video.theme}`} compact />
          <Chip label="#video" compact />
          <Chip label="#gavigo" compact />
        </View>
      </View>

      {/* Right-side action buttons */}
      <View
        className="absolute items-center"
        style={{ right: 8, bottom: 100, gap: 18 }}
      >
        <LikeButton contentId={video.id} initialCount={video.like_count} />
        <CommentButton contentId={video.id} initialCount={video.comment_count} />
        <ShareButton contentId={video.id} title={video.title} />
      </View>
    </>
  );
}
