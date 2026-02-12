import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentButton } from '@/components/social/CommentButton';
import { ShareButton } from '@/components/social/ShareButton';
import { FollowButton } from '@/components/social/FollowButton';
import { Avatar, Badge, Chip } from '@/components/ui';
import type { ContentItem, ContainerStatus } from '@/types';

interface ContentOverlayProps {
  item: ContentItem;
  containerStatus: ContainerStatus;
}

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  VIDEO: 'play-circle',
  GAME: 'game-controller',
  AI_SERVICE: 'sparkles',
};

export function ContentOverlay({ item, containerStatus }: ContentOverlayProps) {
  // Generate pseudo-random engagement numbers from content ID
  const hashCode = item.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const baseLikes = Math.abs(hashCode % 10000) + 100;
  const baseComments = Math.abs((hashCode >> 8) % 500) + 10;

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
        <LikeButton contentId={item.id} initialCount={baseLikes} />
        <CommentButton contentId={item.id} initialCount={baseComments} />
        <ShareButton contentId={item.id} title={item.title} />

        {/* Content type indicator */}
        <View className="w-11 h-11 rounded-full bg-accent/60 items-center justify-center">
          <Ionicons
            name={typeIcons[item.type] || 'cube'}
            size={22}
            color="white"
          />
        </View>
      </View>

      {/* Container status badge */}
      <View className="absolute top-4 right-3" pointerEvents="none">
        <Badge status={containerStatus} />
      </View>
    </>
  );
}
