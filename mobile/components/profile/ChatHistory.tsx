import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserConversations } from '@/services/chat';
import { useSocialStore } from '@/stores/socialStore';
import { EmptyState } from '@/components/ui';
import type { Database } from '@/types/supabase';

type Conversation = Database['public']['Tables']['conversations']['Row'];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return 'just now';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ChatHistory({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const hiddenIds = useSocialStore((s) => s.hiddenConversationIds);
  const hideConversation = useSocialStore((s) => s.hideConversation);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const convos = await getUserConversations(userId);
        setConversations(convos);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const visibleConversations = useMemo(
    () => conversations.filter((c) => !hiddenIds.includes(c.id)),
    [conversations, hiddenIds]
  );

  const handleLongPress = useCallback(
    (item: Conversation) => {
      const title = item.title || 'this conversation';
      const doHide = () => hideConversation(item.id);

      if (Platform.OS === 'web') {
        if (window.confirm(`Delete "${title}"?`)) {
          doHide();
        }
      } else {
        Alert.alert(
          'Delete Conversation',
          `Delete "${title}"? It will be hidden from your list.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: doHide },
          ]
        );
      }
    },
    [hideConversation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/(tabs)/chat?conversationId=${item.id}` as any)
        }
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#1e1e30',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(124,58,237,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="chatbubbles" size={18} color="#7c3aed" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '500' }}
            numberOfLines={1}
          >
            {item.title || 'Untitled conversation'}
          </Text>
          <Text style={{ color: '#555568', fontSize: 12, marginTop: 2 }}>
            {item.message_count} messages
            {item.model ? ` · ${item.model}` : ''}
            {' · '}
            {formatTimeAgo(item.updated_at)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#555568" />
      </TouchableOpacity>
    ),
    [router, handleLongPress]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  if (visibleConversations.length === 0) {
    return (
      <View style={{ paddingTop: 40 }}>
        <EmptyState
          icon="chatbubbles-outline"
          title="No conversations yet"
          subtitle="Start chatting with the AI assistant"
          compact
        />
      </View>
    );
  }

  return (
    <FlatList
      data={visibleConversations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
    />
  );
}
