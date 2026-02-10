import { useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEngagement } from '@/hooks/useEngagement';
import { useFeedStore } from '@/stores/feedStore';
import { ContentCard } from '@/components/feed/ContentCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const lastScrollTime = useRef(Date.now());
  const itemHeight = SCREEN_HEIGHT - insets.bottom - 60; // account for tab bar

  const {
    content,
    containerStates,
    currentIndex,
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

          // Send scroll update
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

          // Send activation request
          wsRef.current.sendActivationRequest({ content_id: item.id });
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

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

  return (
    <View className="flex-1 bg-black">
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
      />

      {/* Pagination dots */}
      <View
        className="absolute right-1 items-center gap-1.5"
        style={{ top: '50%', transform: [{ translateY: -50 }] }}
        pointerEvents="none"
      >
        {content.map((_, index) => (
          <View
            key={index}
            className={`w-1 rounded-full ${
              index === currentIndex ? 'h-4 bg-white' : 'h-1.5 bg-white/30'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
