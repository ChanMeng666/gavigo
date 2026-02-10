import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { Avatar, EmptyState, IconButton } from '@/components/ui';
import type { Comment } from '@/types';

interface CommentSheetProps {
  contentId: string;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
}

const EMPTY_COMMENTS: Comment[] = [];

export function CommentSheet({ contentId, bottomSheetRef }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const snapPoints = useMemo(() => ['55%', '85%'], []);

  const comments = useSocialStore((s) => s.comments[contentId] ?? EMPTY_COMMENTS);
  const addComment = useSocialStore((s) => s.addComment);
  const setComments = useSocialStore((s) => s.setComments);
  const user = useAuthStore((s) => s.user);

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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#1e1e30' }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 40 }}
      enablePanDownToClose
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-border">
        <Text className="text-body font-semibold text-text-primary">
          {comments.length} Comments
        </Text>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Close comments"
        >
          <Ionicons name="close" size={24} color="#8e8ea0" />
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      <BottomSheetFlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
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
          <BottomSheetTextInput
            value={input}
            onChangeText={setInput}
            placeholder="Add a comment..."
            placeholderTextColor="#555568"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            style={{
              flex: 1,
              color: '#f0f0f5',
              fontSize: 13,
              lineHeight: 18,
              paddingVertical: 10,
            }}
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
    </BottomSheetModal>
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
