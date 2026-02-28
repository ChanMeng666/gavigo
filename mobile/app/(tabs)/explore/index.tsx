import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Chip, EmptyState } from '@/components/ui';
import { STUDIOS, ALL_GAMES } from '@/data/games';
import type { StudioGame } from '@/data/games';
import { sendUserAction } from '@/services/wsEvents';
import {
  searchVideos as searchSupabaseVideos,
  fetchFeed,
  fetchVideosByTheme,
} from '@/services/feed';
import type { Video } from '@/types/supabase';
import defaultVideos from '../../../../shared/defaultVideos.json';

const bundledVideos = defaultVideos as Video[];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const THEMES = [
  { key: 'all', label: 'All', icon: 'grid-outline' as const },
  { key: 'nature', label: 'Nature', icon: 'leaf-outline' as const },
  { key: 'sports', label: 'Sports', icon: 'football-outline' as const },
  { key: 'technology', label: 'Tech', icon: 'hardware-chip-outline' as const },
  { key: 'city', label: 'City', icon: 'business-outline' as const },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { key: 'ocean', label: 'Ocean', icon: 'water-outline' as const },
  { key: 'space', label: 'Space', icon: 'planet-outline' as const },
  { key: 'dance', label: 'Dance', icon: 'musical-notes-outline' as const },
  { key: 'animals', label: 'Animals', icon: 'paw-outline' as const },
  { key: 'music', label: 'Music', icon: 'musical-note-outline' as const },
  { key: 'travel', label: 'Travel', icon: 'airplane-outline' as const },
  { key: 'fitness', label: 'Fitness', icon: 'barbell-outline' as const },
  { key: 'fashion', label: 'Fashion', icon: 'shirt-outline' as const },
  { key: 'winter', label: 'Winter', icon: 'snow-outline' as const },
  { key: 'sunset', label: 'Sunset', icon: 'sunny-outline' as const },
  { key: 'underwater', label: 'Underwater', icon: 'fish-outline' as const },
  { key: 'architecture', label: 'Architecture', icon: 'home-outline' as const },
  { key: 'adventure', label: 'Adventure', icon: 'compass-outline' as const },
  { key: 'festival', label: 'Festival', icon: 'sparkles-outline' as const },
  { key: 'abstract', label: 'Abstract', icon: 'color-palette-outline' as const },
];

// Videos per row in the grid
const VIDEOS_PER_ROW = 2;

// Flatten all games from all studios into a single list
// ALL_GAMES is imported from @/data/games

const GAME_CARD_WIDTH = 110;

type ExploreItem = { type: 'video-row'; videos: Video[] };

function buildExploreData(videos: Video[]): ExploreItem[] {
  const items: ExploreItem[] = [];
  let videoIdx = 0;

  while (videoIdx < videos.length) {
    const row = videos.slice(videoIdx, videoIdx + VIDEOS_PER_ROW);
    items.push({ type: 'video-row', videos: row });
    videoIdx += VIDEOS_PER_ROW;
  }

  return items;
}

function GameThumbnailCard({ game, onPress }: { game: StudioGame; onPress: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: GAME_CARD_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#2a2a40',
      }}
    >
      {/* Cover image */}
      <View style={{ height: GAME_CARD_WIDTH, backgroundColor: '#0e0e18' }}>
        {game.thumbnail && !imgFailed ? (
          <Image
            source={{ uri: game.thumbnail }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36 }}>{game.emoji}</Text>
          </View>
        )}
        {/* Play icon overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="play" size={16} color="white" />
          </View>
        </View>
      </View>
      {/* Title */}
      <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Text
          numberOfLines={1}
          style={{ color: '#f0f0f5', fontSize: 12, fontWeight: '600' }}
        >
          {game.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadVideos = useCallback(async () => {
    try {
      let supabaseData: Video[];
      if (search.trim()) {
        supabaseData = await searchSupabaseVideos(search.trim(), 1, 30);
      } else if (activeFilter !== 'all') {
        supabaseData = await fetchVideosByTheme(activeFilter, 1, 30);
      } else {
        supabaseData = await fetchFeed(1, 60);
      }

      // Merge: Supabase results + bundled defaults (deduplicated)
      let local: Video[];
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        local = bundledVideos.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.theme.toLowerCase().includes(q) ||
            v.photographer.toLowerCase().includes(q)
        );
      } else if (activeFilter !== 'all') {
        local = bundledVideos.filter((v) => v.theme === activeFilter);
      } else {
        local = bundledVideos;
      }

      // Deduplicate: Supabase wins for same pexels_id, then append bundled-only videos
      const seenPexelsIds = new Set(supabaseData.map((v) => v.pexels_id));
      const extra = local.filter((v) => !seenPexelsIds.has(v.pexels_id));
      const merged = [...supabaseData, ...extra];

      setVideos(merged);
    } catch {
      // On network error, use bundled defaults
      if (activeFilter !== 'all') {
        setVideos(bundledVideos.filter((v) => v.theme === activeFilter));
      } else {
        setVideos(bundledVideos);
      }
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      loadVideos();
      if (search.trim()) {
        sendUserAction({ action: 'search', screen: 'explore', value: search.trim() });
      }
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadVideos, search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  }, [loadVideos]);

  const handleGamePress = useCallback(
    (gameId: string) => {
      sendUserAction({ action: 'game_tap', screen: 'explore', value: gameId });
      router.push(`/game/${gameId}`);
    },
    [router]
  );

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const exploreData = buildExploreData(videos);

  const renderVideoCard = (item: Video) => (
    <TouchableOpacity
      key={item.id}
      style={{ width: CARD_WIDTH, marginBottom: 12 }}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Play ${item.title}`}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <View className="bg-bg-surface rounded-card border border-border overflow-hidden">
        {/* Thumbnail */}
        <View className="h-36 bg-bg-surface">
          <Image
            source={{ uri: item.thumbnail_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          {/* Play icon overlay */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
              <Ionicons name="play" size={20} color="white" />
            </View>
          </View>
          {/* Duration badge */}
          <View className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5">
            <Text className="text-micro text-white">
              {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View className="p-3">
          <Text
            className="text-caption font-semibold text-text-primary"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            className="text-micro text-text-tertiary mt-0.5"
            numberOfLines={1}
          >
            {item.photographer}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-0.5">
                <Ionicons name="heart" size={12} color="#f87171" />
                <Text className="text-micro text-text-tertiary">
                  {formatCount(item.like_count)}
                </Text>
              </View>
              <View className="flex-row items-center gap-0.5">
                <Ionicons name="chatbubble" size={12} color="#8e8ea0" />
                <Text className="text-micro text-text-tertiary">
                  {formatCount(item.comment_count)}
                </Text>
              </View>
            </View>
            <Text className="text-micro text-accent">#{item.theme}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderItem = useRef(({ item }: { item: ExploreItem }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        {item.videos.map((v) => renderVideoCard(v))}
        {/* Spacer if odd number */}
        {item.videos.length < VIDEOS_PER_ROW && (
          <View style={{ width: CARD_WIDTH }} />
        )}
      </View>
    );
  }).current;

  const keyExtractor = useRef((item: ExploreItem, index: number) => {
    return `row-${item.videos.map((v) => v.id).join('-')}`;
  }).current;

  const gamesSection = (
    <View style={{ marginBottom: 16 }}>
      {/* Section header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="game-controller" size={16} color="#a78bfa" />
          <Text style={{ color: '#f0f0f5', fontSize: 15, fontWeight: '600' }}>
            Games
          </Text>
        </View>
        <Text style={{ color: '#8e8ea0', fontSize: 12 }}>
          {ALL_GAMES.length} games
        </Text>
      </View>
      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {ALL_GAMES.map((game) => (
          <GameThumbnailCard
            key={game.id}
            game={game}
            onPress={() => handleGamePress(game.id)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-bg-base" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pb-3">
        <Text
          className="text-h1 text-text-primary mb-0.5"
          accessibilityRole="header"
        >
          Explore
        </Text>
        <Text className="text-caption text-text-secondary mb-4">
          Discover videos & games
        </Text>

        {/* Search */}
        <View className="mb-3">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search videos..."
            variant="search"
            leftIcon="search"
            rightIcon={search ? 'close-circle' : undefined}
            onRightIconPress={() => setSearch('')}
          />
        </View>

        {/* Theme filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {THEMES.map((theme) => (
            <Chip
              key={theme.key}
              label={theme.label}
              selected={activeFilter === theme.key}
              onPress={() => {
                setActiveFilter(theme.key);
                if (theme.key !== 'all') {
                  sendUserAction({ action: 'filter', screen: 'explore', value: theme.key });
                }
              }}
              leftIcon={theme.icon}
            />
          ))}
        </ScrollView>
      </View>

      {/* Video grid with games section header */}
      <FlatList
        data={exploreData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={gamesSection}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="search-outline"
              title="No videos found"
              subtitle="Try a different search or filter"
            />
          )
        }
      />
    </View>
  );
}
