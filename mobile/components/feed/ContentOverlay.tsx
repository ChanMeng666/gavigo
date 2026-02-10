import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentButton } from '@/components/social/CommentButton';
import { ShareButton } from '@/components/social/ShareButton';
import { FollowButton } from '@/components/social/FollowButton';
import type { ContentItem, ContainerStatus } from '@/types';

interface ContentOverlayProps {
  item: ContentItem;
  containerStatus: ContainerStatus;
}

const typeEmoji: Record<string, string> = {
  VIDEO: '🎬',
  GAME: '🎮',
  AI_SERVICE: '🤖',
};

const statusColors: Record<ContainerStatus, string> = {
  COLD: '#3b82f6',
  WARM: '#eab308',
  HOT: '#22c55e',
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
      {/* Bottom info overlay */}
      <View
        className="absolute bottom-0 left-0 right-14 p-4"
        pointerEvents="box-none"
      >
        {/* Creator info */}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
            <Text className="text-xs font-bold text-white">
              {item.theme[0].toUpperCase()}
            </Text>
          </View>
          <Text className="text-white font-semibold text-sm">
            @gavigo_{item.theme}
          </Text>
          <FollowButton userId={`gavigo_${item.theme}`} compact />
        </View>

        {/* Title and description */}
        <Text className="text-white font-bold text-base mb-1">
          {item.title}
        </Text>
        <Text className="text-white/70 text-sm mb-2" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-1.5">
          <Text className="text-white/80 text-xs">#{item.theme}</Text>
          <Text className="text-white/80 text-xs">
            #{item.type.toLowerCase()}
          </Text>
          <Text className="text-white/80 text-xs">#gavigo</Text>
          <Text className="text-white/80 text-xs">#ire</Text>
        </View>
      </View>

      {/* Right-side action buttons */}
      <View className="absolute right-2 bottom-32 items-center gap-5">
        <LikeButton contentId={item.id} initialCount={baseLikes} />
        <CommentButton contentId={item.id} initialCount={baseComments} />
        <ShareButton contentId={item.id} title={item.title} />

        {/* Content type indicator */}
        <View className="w-11 h-11 rounded-full bg-purple-600/80 items-center justify-center">
          <Text className="text-lg">{typeEmoji[item.type] || '📦'}</Text>
        </View>
      </View>

      {/* Container status badge */}
      <View className="absolute top-4 right-3" pointerEvents="none">
        <View
          className="flex-row items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ backgroundColor: statusColors[containerStatus] + '33' }}
        >
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors[containerStatus] }}
          />
          <Text
            className="text-[10px] font-medium"
            style={{ color: statusColors[containerStatus] }}
          >
            {containerStatus}
          </Text>
        </View>
      </View>
    </>
  );
}
