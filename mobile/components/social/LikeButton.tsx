import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  type SharedValue,
} from 'react-native-reanimated';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { toggleLike as toggleLikeApi } from '@/services/social';

interface LikeButtonProps {
  contentId: string;
  initialCount: number;
}

const PARTICLE_COUNT = 6;
const PARTICLE_COLORS = ['#FE2C55', '#FF6B8A', '#FE2C55', '#FF6B8A', '#FE2C55', '#FF6B8A'];
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  angle: (i * 2 * Math.PI) / PARTICLE_COUNT,
  color: PARTICLE_COLORS[i],
}));

export function LikeButton({ contentId, initialCount }: LikeButtonProps) {
  const isLiked = useSocialStore((s) => s.likes[contentId] ?? false);
  const likeCount = useSocialStore(
    (s) => s.likeCounts[contentId] ?? initialCount
  );
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const scale = useSharedValue(1);

  // Particle shared values
  const particleRadius = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    const wasLiked = isLiked;
    // Optimistic update
    toggleLike(contentId);

    // Snappy bounce: 1 → 1.25 → 0.95 → 1
    scale.value = withSequence(
      withSpring(1.25, { damping: 8, stiffness: 400 }),
      withSpring(0.95, { damping: 10, stiffness: 350 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );

    // Particle burst on like (not unlike)
    if (!wasLiked) {
      particleOpacity.value = 1;
      particleRadius.value = 0;
      particleRadius.value = withTiming(20, { duration: 300 });
      particleOpacity.value = withDelay(100, withTiming(0, { duration: 250 }));
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
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={28}
          color={isLiked ? '#FE2C55' : 'white'}
        />
        {/* Particle burst */}
        {PARTICLES.map((p, i) => (
          <ParticleDot
            key={i}
            angle={p.angle}
            color={p.color}
            radius={particleRadius}
            opacity={particleOpacity}
          />
        ))}
      </Animated.View>
      <Text className="text-micro text-text-primary">
        {formatCount(likeCount)}
      </Text>
    </TouchableOpacity>
  );
}

function ParticleDot({
  angle,
  color,
  radius,
  opacity,
}: {
  angle: number;
  color: string;
  radius: SharedValue<number>;
  opacity: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: color,
    opacity: opacity.value,
    transform: [
      { translateX: Math.cos(angle) * radius.value },
      { translateY: Math.sin(angle) * radius.value },
    ],
  }));

  return <Animated.View style={style} pointerEvents="none" />;
}
