import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View className="absolute bottom-0 left-0 right-0" pointerEvents="none">
        <View style={{ height: 30, backgroundColor: 'rgba(0,0,0,0.05)' }} />
        <View style={{ height: 60, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        <View style={{ height: 100, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        <View style={{ height: 160, backgroundColor: 'rgba(0,0,0,0.7)' }} />
      </View>

      {/* Bottom info overlay */}
      <View
        className="absolute bottom-0 left-0 right-14 p-4"
        pointerEvents="box-none"
      >
        {/* Creator info */}
        <View className="flex-row items-center gap-2 mb-2">
          <Avatar name={video.photographer} size="sm" />
          <Text className="text-body font-semibold text-text-primary">
            @{video.photographer.replace(/\s+/g, '_').toLowerCase()}
          </Text>
          <FollowButton userId={video.photographer} compact />
        </View>

        {/* Title and description */}
        <Text className="text-h3 text-text-primary mb-1" numberOfLines={2}>
          {video.title}
        </Text>
        <Text className="text-caption text-text-primary/70 mb-2" numberOfLines={2}>
          {video.description}
        </Text>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-1.5">
          <Chip label={`#${video.theme}`} compact />
          <Chip label="#video" compact />
          <Chip label="#gavigo" compact />
        </View>
      </View>

      {/* Right-side action buttons */}
      <View className="absolute right-2 bottom-32 items-center gap-5">
        <LikeButton contentId={video.id} initialCount={video.like_count} />
        <CommentButton contentId={video.id} initialCount={video.comment_count} />
        <ShareButton contentId={video.id} title={video.title} />

        {/* Video type indicator */}
        <View className="w-11 h-11 rounded-full bg-accent/60 items-center justify-center">
          <Ionicons name="play-circle" size={22} color="white" />
        </View>
      </View>
    </>
  );
}
