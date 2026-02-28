import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  type ViewToken,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoPlayer } from '@/components/feed/VideoPlayer';
import { VideoOverlay } from '@/components/feed/VideoOverlay';
import { fetchVideoById, fetchVideosByTheme, fetchFeed } from '@/services/feed';
import type { Video } from '@/types/supabase';
import { useRef } from 'react';
import defaultVideos from '../../../shared/defaultVideos.json';

const bundledVideos = defaultVideos as Video[];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const initialScrollDone = useRef(false);

  const itemHeight = SCREEN_HEIGHT;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        // Try Supabase first, then fall back to bundled videos
        let target = await fetchVideoById(id).catch(() => null);
        if (!target) {
          target = bundledVideos.find((v) => v.id === id) ?? null;
        }
        if (!target || cancelled) {
          setLoading(false);
          return;
        }

        // Build playlist from both Supabase and bundled videos
        let themeVideos: Video[] = [];
        let generalVideos: Video[] = [];
        try {
          themeVideos = await fetchVideosByTheme(target.theme, 1, 20);
          generalVideos = await fetchFeed(1, 20);
        } catch {
          // Network failed — use bundled only
        }

        // Supplement with bundled videos
        const bundledTheme = bundledVideos.filter((v) => v.theme === target!.theme);
        const bundledGeneral = bundledVideos;

        // Deduplicated playlist: target first, then same-theme, then general
        const seen = new Set<string>();
        const playlist: Video[] = [];

        playlist.push(target);
        seen.add(target.id);

        for (const v of [...themeVideos, ...bundledTheme]) {
          if (!seen.has(v.id)) {
            playlist.push(v);
            seen.add(v.id);
          }
        }

        for (const v of [...generalVideos, ...bundledGeneral]) {
          if (!seen.has(v.id)) {
            playlist.push(v);
            seen.add(v.id);
          }
        }

        if (!cancelled) {
          setVideos(playlist);
        }
      } catch {
        // Keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <View style={{ height: itemHeight }}>
        <View style={{ flex: 1, backgroundColor: '#0e0e18', overflow: 'hidden' }}>
          <VideoPlayer
            contentId={item.id}
            isVisible={index === currentIndex}
            videoUrl={item.video_url}
            thumbnailUrl={item.thumbnail_url}
          />
          <VideoOverlay video={item} />
        </View>
      </View>
    ),
    [itemHeight, currentIndex]
  );

  if (loading) {
    return (
      <View className="flex-1 bg-bg-base items-center justify-center">
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View className="flex-1 bg-bg-base items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#555568" />
        <Text className="text-body text-text-secondary mt-3">Video not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-body text-accent">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Scroll progress
  const thumbHeight = videos.length > 0 ? 40 / videos.length : 40;
  const thumbOffset = videos.length > 1
    ? (currentIndex / (videos.length - 1)) * (40 - thumbHeight)
    : 0;

  return (
    <View className="flex-1 bg-bg-base">
      <FlatList
        ref={flatListRef}
        data={videos}
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

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute bg-black/40 w-10 h-10 rounded-full items-center justify-center"
        style={{ top: insets.top + 8, left: 12 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Vertical scroll progress bar */}
      {videos.length > 1 && (
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
      )}
    </View>
  );
}
