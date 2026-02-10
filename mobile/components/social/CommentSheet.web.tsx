// Web-specific CommentSheet fallback — uses Modal instead of @gorhom/bottom-sheet
// which may have issues inside iframe contexts
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { Avatar, EmptyState, IconButton } from '@/components/ui';
import type { Comment } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const EMPTY_COMMENTS: Comment[] = [];

interface CommentSheetProps {
  contentId: string;
  bottomSheetRef: React.RefObject<{ present: () => void; dismiss: () => void } | null>;
}

export function CommentSheet({ contentId, bottomSheetRef }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const comments = useSocialStore((s) => s.comments[contentId] ?? EMPTY_COMMENTS);
  const addComment = useSocialStore((s) => s.addComment);
  const setComments = useSocialStore((s) => s.setComments);
  const user = useAuthStore((s) => s.user);

  // Expose present/dismiss via ref
  useEffect(() => {
    if (bottomSheetRef && 'current' in bottomSheetRef) {
      (bottomSheetRef as React.MutableRefObject<any>).current = {
        present: () => setVisible(true),
        dismiss: () => setVisible(false),
      };
    }
  }, [bottomSheetRef]);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const data = await api.getComments(contentId);
        setComments(contentId, data);
      } catch {
        // Use existing
      }
    })();
  }, [contentId, visible, setComments]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput('');

    const tempComment: Comment = {
      id: Date.now().toString(),
      user_id: user?.id ?? '',
      content_id: contentId,
      text,
      username: user?.username ?? 'user',
      avatar_url: user?.avatar_url ?? null,
      created_at: new Date().toISOString(),
    };
    addComment(contentId, tempComment);

    setLoading(true);
    try {
      await api.postComment(contentId, text);
    } catch {
      // Shown optimistically
    } finally {
      setLoading(false);
    }
  };

  const onClose = useCallback(() => setVisible(false), []);

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View className="flex-row gap-3 px-4 py-3">
        <Avatar uri={item.avatar_url} name={item.username} size="sm" />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-caption font-semibold text-text-primary">
              {item.username}
            </Text>
            <Text className="text-micro text-text-tertiary">
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text className="text-caption text-text-primary/80 mt-0.5">
            {item.text}
          </Text>
        </View>
      </View>
    ),
    []
  );

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="rounded-t-sheet"
        style={{ maxHeight: SCREEN_HEIGHT * 0.7, backgroundColor: '#1e1e30' }}
      >
        {/* Handle bar */}
        <View className="items-center py-3">
          <View className="w-10 h-1 rounded-full bg-white/20" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border">
          <Text className="text-body font-semibold text-text-primary">
            {comments.length} Comments
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close comments"
          >
            <Ionicons name="close" size={24} color="#8e8ea0" />
          </TouchableOpacity>
        </View>

        {/* Comments list */}
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-outline"
              title="No comments yet"
              subtitle="Be the first to comment!"
              compact
            />
          }
        />

        {/* Input */}
        <View
          className="flex-row gap-2 p-3 border-t border-border"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <View className="flex-1 flex-row items-center bg-white/8 rounded-pill px-4">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Add a comment..."
              placeholderTextColor="#555568"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              className="flex-1 text-caption text-text-primary py-2.5"
            />
          </View>
          <IconButton
            icon="send"
            variant="accent"
            size={18}
            onPress={handleSend}
            disabled={!input.trim() || loading}
            accessibilityLabel="Send comment"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}
