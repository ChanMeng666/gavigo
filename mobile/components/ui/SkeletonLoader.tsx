import { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type SkeletonVariant = 'rect' | 'circle' | 'text';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

export function SkeletonLoader({
  variant = 'rect',
  width,
  height,
  style,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const variantStyles: ViewStyle =
    variant === 'circle'
      ? {
          width: (width as number) || 40,
          height: (height as number) || 40,
          borderRadius: ((width as number) || 40) / 2,
        }
      : variant === 'text'
        ? {
            width: width || '60%',
            height: (height as number) || 12,
            borderRadius: 6,
          }
        : {
            width: width || '100%',
            height: height || 100,
            borderRadius: 16,
          };

  return (
    <Animated.View
      style={[
        { backgroundColor: '#161625' },
        variantStyles,
        animatedStyle,
        style,
      ]}
    />
  );
}
