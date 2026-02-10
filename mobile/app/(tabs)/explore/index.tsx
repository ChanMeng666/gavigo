import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFeedStore } from '@/stores/feedStore';
import { TextInput, Chip, Badge, EmptyState } from '@/components/ui';
import type { ContentItem, ContentType } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  VIDEO: 'play-circle',
  GAME: 'game-controller',
  AI_SERVICE: 'sparkles',
};

const typeGradientColors: Record<string, string> = {
  VIDEO: '#7c3aed',
  GAME: '#3b82f6',
  AI_SERVICE: '#06b6d4',
};

interface FilterDef {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  typeFilter?: ContentType;
}

const filters: FilterDef[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'video', label: 'Videos', icon: 'play-circle-outline', typeFilter: 'VIDEO' },
  { key: 'game', label: 'Games', icon: 'game-controller-outline', typeFilter: 'GAME' },
  { key: 'ai', label: 'AI', icon: 'sparkles-outline', typeFilter: 'AI_SERVICE' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const content = useFeedStore((s) => s.content);
  const containerStates = useFeedStore((s) => s.containerStates);
  const setCurrentIndex = useFeedStore((s) => s.setCurrentIndex);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.theme.toLowerCase().includes(search.toLowerCase());

    const filterDef = filters.find((f) => f.key === activeFilter);
    const matchesFilter =
      activeFilter === 'all' || item.type === filterDef?.typeFilter;

    return matchesSearch && matchesFilter;
  });

  const getFilterCount = (key: string) => {
    const filterDef = filters.find((f) => f.key === key);
    if (key === 'all') return content.length;
    return content.filter((item) => item.type === filterDef?.typeFilter).length;
  };

  const handleCardPress = useCallback(
    (item: ContentItem) => {
      const idx = content.findIndex((c) => c.id === item.id);
      if (idx >= 0) {
        setCurrentIndex(idx);
        router.push('/(tabs)/feed');
      }
    },
    [content, setCurrentIndex, router]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderCard = ({ item }: { item: ContentItem }) => {
    const status = containerStates[item.id] || item.container_status;
    const gradientColor = typeGradientColors[item.type] || '#7c3aed';
    const iconName = typeIcons[item.type] || 'cube';
    const score = item.combined_score || 0;

    return (
      <TouchableOpacity
        className="mb-3"
        style={{ width: CARD_WIDTH }}
        activeOpacity={0.8}
        onPress={() => handleCardPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${status}`}
      >
        <View className="bg-bg-surface rounded-card border border-border overflow-hidden">
          {/* Thumbnail */}
          <View
            className="h-36 items-center justify-center"
            style={{ backgroundColor: gradientColor + '15' }}
          >
            <Ionicons
              name={iconName}
              size={40}
              color={gradientColor + '40'}
            />
            {/* Type badge top-right */}
            <View className="absolute top-2 right-2 bg-black/50 rounded-bl-xl px-2 py-1 flex-row items-center gap-1">
              <Ionicons name={iconName} size={10} color="white" />
              <Text className="text-micro text-white">
                {item.type === 'AI_SERVICE' ? 'AI' : item.type === 'VIDEO' ? 'Video' : 'Game'}
              </Text>
            </View>
          </View>

          {/* Score bar */}
          {score > 0 && (
            <View className="h-[3px] bg-accent-subtle">
              <View
                className="h-full bg-accent"
                style={{ width: `${Math.min(score * 100, 100)}%` }}
              />
            </View>
          )}

          {/* Info */}
          <View className="p-3">
            <Text
              className="text-caption font-semibold text-text-primary"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-micro text-text-tertiary">
                #{item.theme}
              </Text>
              <Badge status={status} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          Discover content
        </Text>

        {/* Search */}
        <View className="mb-3">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search content..."
            variant="search"
            leftIcon="search"
            rightIcon={search ? 'close-circle' : undefined}
            onRightIconPress={() => setSearch('')}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="gap-2"
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              label={`${filter.label} (${getFilterCount(filter.key)})`}
              selected={activeFilter === filter.key}
              onPress={() => setActiveFilter(filter.key)}
              leftIcon={filter.icon}
            />
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredContent}
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
          <EmptyState
            icon="search-outline"
            title="No matches"
            subtitle="Try a different search or filter"
          />
        }
      />
    </View>
  );
}
