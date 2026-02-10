import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useSocialStore } from '@/stores/socialStore';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface LikeButtonProps {
  contentId: string;
  initialCount: number;
}

export function LikeButton({ contentId, initialCount }: LikeButtonProps) {
  const isLiked = useSocialStore((s) => s.likes[contentId] ?? false);
  const likeCount = useSocialStore(
    (s) => s.likeCounts[contentId] ?? initialCount
  );
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    // Optimistic update
    toggleLike(contentId);

    // Animate
    scale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );

    // API call (fire and forget)
    if (isAuthenticated) {
      try {
        if (!isLiked) {
          await api.likeContent(contentId);
        } else {
          await api.unlikeContent(contentId);
        }
      } catch {
        // Revert on error
        toggleLike(contentId);
      }
    }
  };

  const formatCount = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="items-center gap-1"
      activeOpacity={0.7}
    >
      <Animated.View
        style={animatedStyle}
        className={`w-11 h-11 rounded-full items-center justify-center ${
          isLiked ? 'bg-red-500' : 'bg-white/10'
        }`}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color="white"
        />
      </Animated.View>
      <Text className="text-white text-xs font-medium">
        {formatCount(likeCount)}
      </Text>
    </TouchableOpacity>
  );
}
