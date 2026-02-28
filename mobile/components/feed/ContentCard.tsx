import { useState, useEffect } from 'react';
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
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(timer);
  }, [isLoading, status]);

  // Reset immersive mode when scrolling away
  useEffect(() => {
    if (!isVisible) setIsImmersive(false);
  }, [isVisible]);

  const isActiveGame = orchItem.type === 'GAME' && isReady;

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

      {/* Browse mode: overlay + "Tap to play" prompt for active games */}
      {!(isActiveGame && isImmersive) && (
        <>
          <ContentOverlay item={orchItem} containerStatus={status} />

          {/* "Tap to play" prompt — centered over the game */}
          {isActiveGame && (
            <TouchableOpacity
              onPress={() => setIsImmersive(true)}
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                top: '35%',
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 28,
                // @ts-ignore — web backdrop-filter
                backdropFilter: 'blur(8px)',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#7c3aed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="game-controller" size={20} color="#fff" />
              </View>
              <View>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                  Tap to play
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  Enter immersive mode
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Immersive mode: only floating exit button */}
      {isActiveGame && isImmersive && (
        <TouchableOpacity
          onPress={() => setIsImmersive(false)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(0,0,0,0.45)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            // @ts-ignore — web backdrop-filter
            backdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
            Exit
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
