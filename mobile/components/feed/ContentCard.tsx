import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
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
      <View style={{ flex: 1, backgroundColor: '#0e0e18', overflow: 'hidden' }}>
        <VideoPlayer
          contentId={video.id}
          isVisible={isVisible}
          videoUrl={video.video_url}
          thumbnailUrl={video.thumbnail_url}
        />
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
          }}
          pointerEvents="box-none"
        >
          <VideoOverlay video={video} />
        </View>
      </View>
    );
  }

  // Orchestrator items use container lifecycle
  const orchItem = item.data;
  const status = containerStatus || orchItem.container_status;
  const isReady = status === 'HOT';
  const isLoading = status === 'COLD' || status === 'WARM';
  const [timedOut, setTimedOut] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(timer);
  }, [isLoading, status]);

  const isActiveGame = orchItem.type === 'GAME' && isReady;

  // Auto-hide overlay after 1.5s when game becomes visible
  useEffect(() => {
    if (isVisible && isActiveGame) {
      setOverlayVisible(true); // brief info flash
      hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 1500);
    }
    if (!isVisible) {
      setOverlayVisible(true); // reset for next view
      clearTimeout(hideTimerRef.current);
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [isVisible, isActiveGame]);

  // Show overlay briefly on tap
  const showOverlayBriefly = useCallback(() => {
    setOverlayVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setOverlayVisible(false), 3000);
  }, []);

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

      {isReady && orchItem.type === 'GAME' && (
        <GameEmbed
          deploymentName={orchItem.deployment_name}
          isVisible={isVisible}
        />
      )}

      {isReady && orchItem.type === 'AI_SERVICE' && (
        <AIChatEmbed isVisible={isVisible} />
      )}

      {/* Overlay: always for non-games, auto-fade for games */}
      {(!isActiveGame || overlayVisible) && (
        <ContentOverlay item={orchItem} />
      )}

      {/* Floating info toggle — visible when game overlay is hidden */}
      {isActiveGame && !overlayVisible && (
        <TouchableOpacity
          onPress={showOverlayBriefly}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            // @ts-ignore — web backdrop-filter
            backdropFilter: 'blur(8px)',
          }}
        >
          <Ionicons name="information-circle-outline" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}
    </View>
  );
}
