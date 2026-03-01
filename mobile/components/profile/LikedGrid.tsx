import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { EmptyState } from '@/components/ui';

interface LikedVideo {
  content_id: string;
  created_at: string;
  videos: {
    id: string;
    title: string;
    thumbnail_url: string;
    duration: number;
  };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const NUM_COLUMNS = 3;

export function LikedGrid({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [likes, setLikes] = useState<LikedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const cellSize = (screenWidth - 8) / NUM_COLUMNS; // 4px gap between cells

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('content_id, created_at, videos!inner(id, title, thumbnail_url, duration)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setLikes(data as unknown as LikedVideo[]);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const renderItem = useCallback(
    ({ item }: { item: LikedVideo }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          router.push(`/video/${item.videos.id}`);
        }}
        style={{ width: cellSize, height: cellSize }}
      >
        <Image
          source={{ uri: item.videos.thumbnail_url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
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
          <Ionicons name="play" size={24} color="rgba(255,255,255,0.7)" />
        </View>
        {/* Duration badge */}
        <View
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 4,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10 }}>
            {formatDuration(item.videos.duration)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [cellSize]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  if (likes.length === 0) {
    return (
      <View style={{ paddingTop: 40 }}>
        <EmptyState
          icon="heart-outline"
          title="No liked content yet"
          subtitle="Videos you like will appear here"
          compact
        />
      </View>
    );
  }

  return (
    <FlatList
      data={likes}
      renderItem={renderItem}
      keyExtractor={(item) => item.content_id}
      numColumns={NUM_COLUMNS}
      scrollEnabled={false}
      contentContainerStyle={{ gap: 2 }}
      columnWrapperStyle={{ gap: 2 }}
    />
  );
}
