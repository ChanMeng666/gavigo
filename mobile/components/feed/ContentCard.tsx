import { View, Text, ActivityIndicator } from 'react-native';
import { VideoPlayer } from './VideoPlayer';
import { GameEmbed } from './GameEmbed';
import { AIChatEmbed } from './AIChatEmbed';
import { ContentOverlay } from './ContentOverlay';
import type { ContentItem, ContainerStatus } from '@/types';

interface ContentCardProps {
  item: ContentItem;
  containerStatus: ContainerStatus;
  isVisible: boolean;
  onActivate: (contentId: string) => void;
}

function LoadingState({
  item,
  status,
}: {
  item: ContentItem;
  status: ContainerStatus;
}) {
  const statusMessages: Record<ContainerStatus, string> = {
    COLD: 'Spinning up container...',
    WARM: 'Almost ready...',
    HOT: 'Loading content...',
  };

  const statusColors: Record<ContainerStatus, string> = {
    COLD: '#3b82f6',
    WARM: '#eab308',
    HOT: '#22c55e',
  };

  return (
    <View className="absolute inset-0 items-center justify-center bg-gray-900">
      <View
        className="h-24 w-24 rounded-3xl items-center justify-center mb-6"
        style={{ backgroundColor: statusColors[status] + '33' }}
      >
        <Text className="text-4xl">
          {item.type === 'VIDEO' ? '🎬' : item.type === 'GAME' ? '🎮' : '🤖'}
        </Text>
      </View>
      <Text className="text-white font-bold text-lg mb-2">{item.title}</Text>
      <View className="flex-row items-center gap-2">
        <ActivityIndicator color={statusColors[status]} size="small" />
        <Text className="text-white/60 text-sm">{statusMessages[status]}</Text>
      </View>

      {/* Status badge */}
      <View
        className="absolute bottom-20 flex-row items-center gap-2 px-3 py-1.5 rounded-full"
        style={{ backgroundColor: statusColors[status] + '22' }}
      >
        <View
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColors[status] }}
        />
        <Text style={{ color: statusColors[status] }} className="text-xs font-medium">
          {status}
        </Text>
      </View>
    </View>
  );
}

export function ContentCard({
  item,
  containerStatus,
  isVisible,
  onActivate,
}: ContentCardProps) {
  const isReady = containerStatus === 'HOT';
  const isLoading = containerStatus === 'COLD' || containerStatus === 'WARM';

  return (
    <View className="flex-1 bg-black">
      {/* Content area */}
      {isLoading && <LoadingState item={item} status={containerStatus} />}

      {isReady && item.type === 'VIDEO' && (
        <VideoPlayer contentId={item.id} isVisible={isVisible} />
      )}

      {isReady && item.type === 'GAME' && (
        <GameEmbed
          deploymentName={item.deployment_name}
          isVisible={isVisible}
        />
      )}

      {isReady && item.type === 'AI_SERVICE' && (
        <AIChatEmbed isVisible={isVisible} />
      )}

      {/* TikTok-style overlay - always visible */}
      <ContentOverlay item={item} containerStatus={containerStatus} />
    </View>
  );
}
