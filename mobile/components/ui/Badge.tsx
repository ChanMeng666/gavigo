import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { ContainerStatus } from '@/types';

interface BadgeProps {
  status: ContainerStatus;
}

const statusConfig: Record<
  ContainerStatus,
  { color: string; bg: string; label: string }
> = {
  COLD: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: 'Cold' },
  WARM: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Warm' },
  HOT: { color: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Hot' },
};

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status];
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    if (status === 'HOT') {
      dotOpacity.value = withRepeat(
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      dotOpacity.value = 1;
    }
  }, [status, dotOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View
      className="flex-row items-center gap-1.5 rounded-pill px-2.5 py-1"
      style={{ backgroundColor: config.bg }}
    >
      <Animated.View
        style={[
          { width: 6, height: 6, borderRadius: 3, backgroundColor: config.color },
          dotStyle,
        ]}
      />
      <Text
        className="text-micro font-medium"
        style={{ color: config.color }}
      >
        {config.label}
      </Text>
    </View>
  );
}
