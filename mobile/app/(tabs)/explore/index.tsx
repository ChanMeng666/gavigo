import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedStore } from '@/stores/feedStore';
import type { ContentItem } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const typeEmoji: Record<string, string> = {
  VIDEO: '🎬',
  GAME: '🎮',
  AI_SERVICE: '🤖',
};

const statusColors: Record<string, string> = {
  COLD: '#3b82f6',
  WARM: '#eab308',
  HOT: '#22c55e',
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const content = useFeedStore((s) => s.content);
  const containerStates = useFeedStore((s) => s.containerStates);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = ['all', 'video', 'game', 'ai'];

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.theme.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'video' && item.type === 'VIDEO') ||
      (activeFilter === 'game' && item.type === 'GAME') ||
      (activeFilter === 'ai' && item.type === 'AI_SERVICE');

    return matchesSearch && matchesFilter;
  });

  const renderCard = ({ item }: { item: ContentItem }) => {
    const status = containerStates[item.id] || item.container_status;

    return (
      <TouchableOpacity
        className="mb-4"
        style={{ width: CARD_WIDTH }}
        activeOpacity={0.8}
      >
        <View className="bg-surface rounded-2xl overflow-hidden border border-border">
          {/* Thumbnail area */}
          <View className="h-36 bg-elevated items-center justify-center">
            <Text className="text-4xl">{typeEmoji[item.type] || '📦'}</Text>
          </View>

          {/* Info */}
          <View className="p-3">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-white/50 text-xs mt-1" numberOfLines={1}>
              {item.description}
            </Text>

            {/* Status and theme */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-white/60 text-xs">#{item.theme}</Text>
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: statusColors[status] + '22' }}
              >
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                />
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: statusColors[status] }}
                >
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pb-3">
        <Text className="text-white text-2xl font-bold mb-4">Explore</Text>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 gap-2 mb-3">
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search content..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="flex-1 py-3 text-white text-sm"
          />
        </View>

        {/* Filters */}
        <View className="flex-row gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full ${
                activeFilter === filter
                  ? 'bg-accent-primary'
                  : 'bg-surface border border-border'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter ? 'text-white' : 'text-white/60'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-white/40 text-sm">No content found</Text>
          </View>
        }
      />
    </View>
  );
}
