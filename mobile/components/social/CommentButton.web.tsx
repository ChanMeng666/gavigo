import { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '@/stores/socialStore';
import { CommentSheet } from './CommentSheet';

interface CommentButtonProps {
  contentId: string;
  initialCount: number;
}

export function CommentButton({ contentId, initialCount }: CommentButtonProps) {
  const bottomSheetRef = useRef<{ present: () => void; dismiss: () => void }>(null);
  const commentCount = useSocialStore(
    (s) => s.commentCounts[contentId] ?? initialCount
  );

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        className="items-center gap-1"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Comment, ${formatCount(commentCount)} comments`}
      >
        <View className="w-11 h-11 rounded-full bg-white/10 items-center justify-center">
          <Ionicons name="chatbubble-outline" size={24} color="white" />
        </View>
        <Text className="text-micro text-text-primary">
          {formatCount(commentCount)}
        </Text>
      </TouchableOpacity>

      <CommentSheet contentId={contentId} bottomSheetRef={bottomSheetRef} />
    </>
  );
}
