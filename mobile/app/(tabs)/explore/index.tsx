import { useState, useCallback, useEffect } from 'react';
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
import {
  searchVideos as searchSupabaseVideos,
  fetchFeed,
  fetchVideosByTheme,
} from '@/services/feed';
import type { Video } from '@/types/supabase';

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
];

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
      let data: Video[];
      if (search.trim()) {
        data = await searchSupabaseVideos(search.trim(), 1, 30);
      } else if (activeFilter !== 'all') {
        data = await fetchVideosByTheme(activeFilter, 1, 30);
      } else {
        data = await fetchFeed(1, 30);
      }
      setVideos(data);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(loadVideos, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadVideos, search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  }, [loadVideos]);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const renderCard = ({ item }: { item: Video }) => (
    <TouchableOpacity
      className="mb-3"
      style={{ width: CARD_WIDTH }}
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
          Discover videos
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
              onPress={() => setActiveFilter(theme.key)}
              leftIcon={theme.icon}
            />
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      <FlatList
        data={videos}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
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
