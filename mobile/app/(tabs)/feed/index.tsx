import { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  type ViewToken,
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
import { ContentCard } from '@/components/feed/ContentCard';
import { SkeletonLoader, EmptyState } from '@/components/ui';

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
  const itemHeight = SCREEN_HEIGHT - insets.bottom - 60;

  const {
    content,
    containerStates,
    currentIndex,
    connected,
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
  } = useFeedStore();

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
  });

  const { startFocus, endFocus } = useEngagement({
    onFocusEvent: ws.sendFocusEvent,
    reportIntervalMs: 1000,
  });

  // Use refs for values accessed inside onViewableItemsChanged
  // so the callback itself never changes (FlatList requirement)
  const currentIndexRef = useRef(currentIndex);
  const startFocusRef = useRef(startFocus);
  const endFocusRef = useRef(endFocus);
  const wsRef = useRef(ws);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { startFocusRef.current = startFocus; }, [startFocus]);
  useEffect(() => { endFocusRef.current = endFocus; }, [endFocus]);
  useEffect(() => { wsRef.current = ws; }, [ws]);

  // Stable callback that never changes - reads latest values from refs
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        const index = firstVisible.index ?? 0;
        const item = firstVisible.item;

        if (item && index !== currentIndexRef.current) {
          setCurrentIndex(index);
          endFocusRef.current();
          startFocusRef.current(item.id, item.theme);

          const now = Date.now();
          const timeDiff = now - lastScrollTime.current;
          wsRef.current.sendScrollUpdate({
            position: index,
            velocity: timeDiff > 0 ? 100 / timeDiff : 0,
            visible_content: viewableItems
              .map((v) => v.item?.id)
              .filter(Boolean),
          });
          lastScrollTime.current = now;

          wsRef.current.sendActivationRequest({ content_id: item.id });
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
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof content)[0]; index: number }) => (
      <View style={{ height: itemHeight }}>
        <ContentCard
          item={item}
          containerStatus={containerStates[item.id] || item.container_status}
          isVisible={index === currentIndex}
          onActivate={(contentId) =>
            ws.sendActivationRequest({ content_id: contentId })
          }
        />
      </View>
    ),
    [itemHeight, containerStates, currentIndex, ws]
  );

  if (content.length === 0 && !connected) {
    return <FeedSkeleton />;
  }

  if (content.length === 0 && connected) {
    return (
      <View className="flex-1 bg-bg-base">
        <EmptyState
          icon="film-outline"
          title="No Content"
          subtitle="Content will appear here when available"
        />
      </View>
    );
  }

  // Scroll progress
  const thumbHeight = content.length > 0 ? 40 / content.length : 40;
  const thumbOffset = content.length > 1
    ? (currentIndex / (content.length - 1)) * (40 - thumbHeight)
    : 0;

  return (
    <View className="flex-1 bg-bg-base">
      <FlatList
        ref={flatListRef}
        data={content}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
