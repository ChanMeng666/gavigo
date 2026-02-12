import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoPlayer } from './VideoPlayer';
import { GameEmbed } from './GameEmbed';
import { AIChatEmbed } from './AIChatEmbed';
import { ContentOverlay } from './ContentOverlay';
import { VideoOverlay } from './VideoOverlay';
import { Badge, EmptyState } from '@/components/ui';
import type { ContentItem, ContainerStatus } from '@/types';
import type { Video } from '@/types/supabase';

// Union type for feed items
export type FeedItem =
  | { kind: 'orchestrator'; data: ContentItem }
  | { kind: 'video'; data: Video };

interface ContentCardProps {
  item: FeedItem;
  containerStatus?: ContainerStatus;
  isVisible: boolean;
  onActivate?: (contentId: string) => void;
}

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  VIDEO: 'play-circle',
  GAME: 'game-controller',
  AI_SERVICE: 'sparkles',
};

const statusColors: Record<ContainerStatus, string> = {
  COLD: '#60a5fa',
  WARM: '#fbbf24',
  HOT: '#34d399',
};

function LoadingState({
  item,
  status,
  timedOut,
  onRetry,
}: {
  item: ContentItem;
  status: ContainerStatus;
  timedOut: boolean;
  onRetry: () => void;
}) {
  if (timedOut) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-bg-base">
        <EmptyState
          icon="time-outline"
          title="Taking too long"
          subtitle="The container is still spinning up"
          actionLabel="Retry"
          onAction={onRetry}
        />
      </View>
    );
  }

  const color = statusColors[status];
  const iconName = typeIcons[item.type] || 'cube';

  return (
    <View className="absolute inset-0 items-center justify-center bg-bg-base">
      <View
        className="w-[72px] h-[72px] rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: color + '1F' }}
      >
        <Ionicons name={iconName} size={32} color={color} />
      </View>
      <Text className="text-h3 text-text-primary mb-2">{item.title}</Text>
      <ActivityIndicator color="#7c3aed" size="small" />
      {status === 'COLD' && (
        <Text className="text-caption text-text-tertiary mt-3">
          Tap to activate
        </Text>
      )}
      <View className="absolute bottom-20">
        <Badge status={status} />
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
  // Supabase video items are always ready (no container lifecycle)
  if (item.kind === 'video') {
    const video = item.data;
    return (
      <View className="flex-1 bg-bg-base">
        <VideoPlayer
          contentId={video.id}
          isVisible={isVisible}
          videoUrl={video.video_url}
        />
        <VideoOverlay video={video} />
      </View>
    );
  }

  // Orchestrator items use container lifecycle
  const orchItem = item.data;
  const status = containerStatus || orchItem.container_status;
  const isReady = status === 'HOT';
  const isLoading = status === 'COLD' || status === 'WARM';
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(timer);
  }, [isLoading, status]);

  return (
    <View className="flex-1 bg-bg-base">
      {isLoading && (
        <LoadingState
          item={orchItem}
          status={status}
          timedOut={timedOut}
          onRetry={() => {
            setTimedOut(false);
            onActivate?.(orchItem.id);
          }}
        />
      )}

      {isReady && orchItem.type === 'VIDEO' && (
        <VideoPlayer contentId={orchItem.id} isVisible={isVisible} />
      )}

      {isReady && orchItem.type === 'GAME' && (
        <GameEmbed
          deploymentName={orchItem.deployment_name}
          isVisible={isVisible}
        />
      )}

      {isReady && orchItem.type === 'AI_SERVICE' && (
        <AIChatEmbed isVisible={isVisible} />
      )}

      {/* TikTok-style overlay - always visible */}
      <ContentOverlay item={orchItem} containerStatus={status} />
    </View>
  );
}
