import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  type ViewToken,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEngagement } from '@/hooks/useEngagement';
import { useFeedStore } from '@/stores/feedStore';
import { setGlobalSend } from '@/services/wsEvents';
import { ContentCard, type FeedItem } from '@/components/feed/ContentCard';
import { SkeletonLoader, EmptyState } from '@/components/ui';
import { fetchFeed } from '@/services/feed';
import { syncVideosFromPexels } from '@/services/videoSync';
import { ALL_GAME_ENTRIES } from '@/data/games';
import defaultVideos from '../../../../shared/defaultVideos.json';
import type { Video } from '@/types/supabase';
import type { ContentItem } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function FeedSkeleton() {
  return (
    <View className="flex-1 bg-bg-base">
      <SkeletonLoader variant="rect" height="100%" />
      {/* Action buttons skeleton */}
      <View className="absolute right-3 bottom-32 items-center gap-5">
        <SkeletonLoader variant="circle" width={44} height={44} />
        <SkeletonLoader variant="circle" width={44} height={44} />
        <SkeletonLoader variant="circle" width={44} height={44} />
      </View>
      {/* Overlay skeleton */}
      <View className="absolute bottom-4 left-4 right-14">
        <SkeletonLoader variant="circle" width={32} height={32} />
        <SkeletonLoader variant="text" width="60%" height={16} style={{ marginTop: 12 }} />
        <SkeletonLoader variant="text" width="80%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

function ConnectionDot({ connected }: { connected: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [connected, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: connected ? '#34d399' : '#f87171',
        },
      ]}
      pointerEvents="none"
    />
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT - 60);
  const itemHeight = containerHeight;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && Math.abs(h - containerHeight) > 1) {
      setContainerHeight(h);
    }
  }, [containerHeight]);

  const {
    content,
    containerStates,
    currentIndex,
    connected,
    videos,
    videosPage,
    videosLoading,
    videosHasMore,
    setContent,
    setContainerStates,
    updateContainerState,
    updateScore,
    setCurrentMode,
    addDecision,
    setResources,
    setSessionId,
    setConnected,
    setCurrentIndex,
    injectContent,
    setVideos,
    appendVideos,
    setVideosPage,
    setVideosLoading,
    setVideosHasMore,
  } = useFeedStore();

  // Stale-while-revalidate: show cached/bundled content instantly,
  // then refresh from Supabase in the background
  useEffect(() => {
    let cancelled = false;

    // Tier 1 & 2: If store already has videos (from MMKV/localStorage persist),
    // render immediately — no skeleton needed
    if (videos.length > 0) {
      setInitialLoading(false);
    } else if ((defaultVideos as Video[]).length > 0) {
      // Tier 1 fallback: load bundled defaults (0ms, no network)
      setVideos(defaultVideos as Video[]);
      setInitialLoading(false);
    }

    // Tier 3: Background refresh from Supabase (non-blocking)
    async function backgroundRefresh() {
      try {
        let vids = await fetchFeed(1);

        // If no videos in Supabase yet, trigger initial Pexels sync
        if (vids.length === 0) {
          await syncVideosFromPexels();
          vids = await fetchFeed(1);
        }

        if (!cancelled && vids.length > 0) {
          setVideos(vids);
          setVideosPage(1);
          setVideosHasMore(vids.length >= 15);
        }
      } catch (err) {
        console.warn('Background feed refresh failed:', err);
      } finally {
        // If we still haven't loaded anything, clear the loading state
        if (!cancelled) setInitialLoading(false);
      }
    }

    backgroundRefresh();
    return () => { cancelled = true; };
  }, [setVideos, setVideosPage, setVideosHasMore]);

  const ws = useWebSocket({
    onConnectionEstablished: (payload) => {
      setSessionId(payload.session_id);
      setConnected(true);
      setContent(payload.initial_content);
      setContainerStates(payload.container_states);
      setCurrentMode(payload.current_mode);
    },
    onContainerStateChange: (payload) => {
      updateContainerState(payload.content_id, payload.new_state);
    },
    onScoreUpdate: (payload) => {
      updateScore(payload.content_id, {
        personal_score: payload.personal_score,
        global_score: payload.global_score,
        combined_score: payload.combined_score,
      });
    },
    onModeChange: (payload) => {
      setCurrentMode(payload.new_mode);
    },
    onDecisionMade: (decision) => {
      addDecision(decision);
    },
    onStreamInject: (payload) => {
      injectContent(payload.content, payload.insert_position);
    },
    onResourceUpdate: (resources) => {
      setResources(resources);
    },
    onActivationReady: (payload) => {
      updateContainerState(payload.content_id, payload.status);
    },
  });

  // Expose WebSocket send globally for screen tracking
  useEffect(() => {
    setGlobalSend(ws.send);
    return () => setGlobalSend(null);
  }, [ws.send]);

  const { startFocus, endFocus } = useEngagement({
    onFocusEvent: ws.sendFocusEvent,
    reportIntervalMs: 1000,
  });

  // Stable session seed for shuffling games (set once on mount)
  const sessionSeed = useRef(Math.random());

  // Merge Supabase videos + orchestrator items into unified feed
  // Pattern: 2 videos → 1 game → 2 videos → 1 game → ...
  // After videos run out, remaining games continue consecutively
  const feedItems: FeedItem[] = useMemo(() => {
    const items: FeedItem[] = [];

    // Use orchestrator games when available (real container states + WS events),
    // otherwise build fallback from local game data for instant feed
    let gameItems: ContentItem[] = content.filter((c) => c.type === 'GAME');
    if (gameItems.length === 0) {
      gameItems = ALL_GAME_ENTRIES.map((g) => ({
        id: g.id,
        type: 'GAME' as const,
        theme: g.theme,
        title: g.title,
        description: g.description,
        thumbnail_url: g.thumbnail,
        container_status: 'HOT' as const,
        deployment_name: g.id,
        personal_score: 0,
        global_score: 0,
        combined_score: 0,
      }));
    }

    // Shuffle games per-session for variety (seeded for stability across re-renders)
    const shuffled = [...gameItems];
    const seed = sessionSeed.current;
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Simple seeded pseudo-random using sin
      const j = Math.floor(Math.abs(Math.sin(seed * (i + 1) * 9301) * 49297) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let vidIdx = 0;
    let gameIdx = 0;

    while (vidIdx < videos.length || gameIdx < shuffled.length) {
      // Add up to 2 videos
      for (let i = 0; i < 2 && vidIdx < videos.length; i++, vidIdx++) {
        items.push({ kind: 'video', data: videos[vidIdx] });
      }
      // Add 1 game (each game appears exactly once)
      if (gameIdx < shuffled.length) {
        items.push({ kind: 'orchestrator', data: shuffled[gameIdx] });
        gameIdx++;
      }
    }

    return items;
  }, [videos, content]);

  // Use refs for values accessed inside onViewableItemsChanged
  const currentIndexRef = useRef(currentIndex);
  const startFocusRef = useRef(startFocus);
  const endFocusRef = useRef(endFocus);
  const wsRef = useRef(ws);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { startFocusRef.current = startFocus; }, [startFocus]);
  useEffect(() => { endFocusRef.current = endFocus; }, [endFocus]);
  useEffect(() => { wsRef.current = ws; }, [ws]);

  // Stable callback that never changes
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        const index = firstVisible.index ?? 0;
        const item = firstVisible.item as FeedItem;

        if (item && index !== currentIndexRef.current) {
          setCurrentIndex(index);

          // Only send orchestrator events for orchestrator items
          if (item.kind === 'orchestrator') {
            const orchItem = item.data;
            endFocusRef.current();
            startFocusRef.current(orchItem.id, orchItem.theme);

            const now = Date.now();
            const timeDiff = now - lastScrollTime.current;
            wsRef.current.sendScrollUpdate({
              position: index,
              velocity: timeDiff > 0 ? 100 / timeDiff : 0,
              visible_content: viewableItems
                .map((v) => {
                  const fi = v.item as FeedItem;
                  return fi.kind === 'orchestrator' ? fi.data.id : null;
                })
                .filter(Boolean) as string[],
            });
            lastScrollTime.current = now;

            wsRef.current.sendActivationRequest({ content_id: orchItem.id });
          }
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncVideosFromPexels();
      const vids = await fetchFeed(1);
      setVideos(vids);
      setVideosPage(1);
      setVideosHasMore(vids.length >= 15);
    } catch {
      // Keep existing
    } finally {
      setRefreshing(false);
    }
  }, [setVideos, setVideosPage, setVideosHasMore]);

  const handleEndReached = useCallback(async () => {
    if (videosLoading || !videosHasMore) return;
    setVideosLoading(true);
    try {
      const nextPage = videosPage + 1;
      const moreVids = await fetchFeed(nextPage);
      if (moreVids.length > 0) {
        appendVideos(moreVids);
        setVideosPage(nextPage);
      } else {
        setVideosHasMore(false);
      }
    } catch {
      // Ignore
    } finally {
      setVideosLoading(false);
    }
  }, [videosLoading, videosHasMore, videosPage, appendVideos, setVideosPage, setVideosHasMore, setVideosLoading]);

  const getItemId = useCallback((item: FeedItem) => {
    if (item.kind === 'video') return `vid-${item.data.id}`;
    return `orch-${item.data.id}`;
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <View style={{ height: itemHeight }}>
        <ContentCard
          item={item}
          containerStatus={
            item.kind === 'orchestrator'
              ? containerStates[item.data.id] || item.data.container_status
              : undefined
          }
          isVisible={index === currentIndex}
          onActivate={
            item.kind === 'orchestrator'
              ? (contentId) =>
                  ws.sendActivationRequest({ content_id: contentId })
              : undefined
          }
        />
      </View>
    ),
    [itemHeight, containerStates, currentIndex, ws]
  );

  if (initialLoading && feedItems.length === 0) {
    return <FeedSkeleton />;
  }

  if (feedItems.length === 0) {
    return (
      <View className="flex-1 bg-bg-base">
        <EmptyState
          icon="film-outline"
          title="No Content"
          subtitle="Pull down to refresh and load videos"
        />
      </View>
    );
  }

  // Scroll progress
  const thumbHeight = feedItems.length > 0 ? 40 / feedItems.length : 40;
  const thumbOffset = feedItems.length > 1
    ? (currentIndex / (feedItems.length - 1)) * (40 - thumbHeight)
    : 0;

  return (
    <View className="flex-1 bg-bg-base" onLayout={handleContainerLayout}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={getItemId}
        pagingEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          videosLoading ? (
            <View style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#7c3aed" size="small" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
          />
        }
      />

      {/* Connection indicator */}
      <View
        className="absolute"
        style={{ top: insets.top + 8, left: 16 }}
        pointerEvents="none"
      >
        <ConnectionDot connected={connected} />
      </View>

      {/* Vertical scroll progress bar */}
      <View
        className="absolute right-1.5 items-center"
        style={{ top: '50%', transform: [{ translateY: -20 }] }}
        pointerEvents="none"
      >
        <View className="w-0.5 rounded-full bg-white/10" style={{ height: 40 }}>
          <View
            className="w-full rounded-full bg-white/60"
            style={{ height: thumbHeight, marginTop: thumbOffset }}
          />
        </View>
      </View>
    </View>
  );
}
