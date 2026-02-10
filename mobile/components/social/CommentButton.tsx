import { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '@/stores/socialStore';
import { CommentSheet } from './CommentSheet';

interface CommentButtonProps {
  contentId: string;
  initialCount: number;
}

export function CommentButton({ contentId, initialCount }: CommentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const commentCount = useSocialStore(
    (s) => s.commentCounts[contentId] ?? initialCount
  );

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        className="items-center gap-1"
        activeOpacity={0.7}
      >
        <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center">
          <Ionicons name="chatbubble-outline" size={24} color="white" />
        </View>
        <Text className="text-white text-xs font-medium">
          {formatCount(commentCount)}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <CommentSheet contentId={contentId} onClose={handleClose} />
      )}
    </>
  );
}
