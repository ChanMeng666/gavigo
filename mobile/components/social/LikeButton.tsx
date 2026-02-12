import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { toggleLike as toggleLikeApi } from '@/services/social';

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
  const flashOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handlePress = async () => {
    // Optimistic update
    toggleLike(contentId);

    scale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );

    if (!isLiked) {
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 200 })
      );
    }

    if (isAuthenticated) {
      try {
        await toggleLikeApi(contentId);
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
      accessibilityRole="button"
      accessibilityLabel={`Like, ${formatCount(likeCount)} likes`}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isLiked ? '#f87171' : 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color="white"
        />
        <Animated.View
          style={[
            flashStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 22,
              backgroundColor: 'white',
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
      <Text className="text-micro text-text-primary">
        {formatCount(likeCount)}
      </Text>
    </TouchableOpacity>
  );
}
