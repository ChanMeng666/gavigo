import { useState, useEffect, useRef } from 'react';
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
import type { Comment } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommentSheetProps {
  contentId: string;
  onClose: () => void;
}

export function CommentSheet({ contentId, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const comments = useSocialStore((s) => s.comments[contentId] ?? []);
  const addComment = useSocialStore((s) => s.addComment);
  const setComments = useSocialStore((s) => s.setComments);
  const user = useAuthStore((s) => s.user);

  // Fetch comments on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await api.getComments(contentId);
        setComments(contentId, data);
      } catch {
        // Use existing comments or empty
      }
    })();
  }, [contentId, setComments]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput('');

    // Optimistic add
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
      // Comment already shown optimistically
    } finally {
      setLoading(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="flex-row gap-3 px-4 py-3">
      <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
        <Text className="text-white text-xs font-bold">
          {item.username[0].toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-white font-semibold text-sm">
            {item.username}
          </Text>
          <Text className="text-white/30 text-xs">
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>
        <Text className="text-white/80 text-sm mt-0.5">{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-surface rounded-t-3xl"
        style={{ maxHeight: SCREEN_HEIGHT * 0.7 }}
      >
        {/* Handle bar */}
        <View className="items-center py-3">
          <View className="w-10 h-1 rounded-full bg-white/20" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border">
          <Text className="text-white font-semibold text-base">
            {comments.length} Comments
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Comments list */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-white/40 text-sm">No comments yet</Text>
              <Text className="text-white/30 text-xs mt-1">
                Be the first to comment!
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View
          className="flex-row gap-2 p-3 border-t border-border"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Add a comment..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2.5 text-sm"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-full bg-accent-primary items-center justify-center"
            style={{ opacity: !input.trim() || loading ? 0.5 : 1 }}
          >
            <Ionicons name="send" size={16} color="white" />
          </TouchableOpacity>
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
