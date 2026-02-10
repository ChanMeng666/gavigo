import { View, Text, Share, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IconButton } from '@/components/ui';

interface ShareButtonProps {
  contentId: string;
  title: string;
}

export function ShareButton({ contentId, title }: ShareButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleShare = async () => {
    scale.value = withSpring(0.9, { damping: 6 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 6 });
    }, 100);

    try {
      await Share.share({
        message:
          Platform.OS === 'ios'
            ? title
            : `Check out "${title}" on GAVIGO IRE! gavigo://content/${contentId}`,
        url: `gavigo://content/${contentId}`,
        title: title,
      });
    } catch {
      // User cancelled or error
    }
  };

  return (
    <View className="items-center gap-1">
      <Animated.View style={animatedStyle}>
        <IconButton
          icon="share-social-outline"
          variant="filled"
          onPress={handleShare}
          accessibilityLabel="Share"
        />
      </Animated.View>
      <Text className="text-micro text-text-primary">Share</Text>
    </View>
  );
}
