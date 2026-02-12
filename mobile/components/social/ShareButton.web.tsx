// Web-specific ShareButton — opens TikTok-style share sheet
import { useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { IconButton } from '@/components/ui';
import { ShareSheet } from './ShareSheet';

interface ShareButtonProps {
  contentId: string;
  title: string;
}

export function ShareButton({ contentId, title }: ShareButtonProps) {
  const scale = useSharedValue(1);
  const [sheetVisible, setSheetVisible] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 6 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 6 });
    }, 100);
    setSheetVisible(true);
  };

  return (
    <>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Animated.View style={animatedStyle}>
          <IconButton
            icon="share-social-outline"
            variant="filled"
            onPress={handlePress}
            accessibilityLabel="Share"
          />
        </Animated.View>
        <Text style={{ fontSize: 10, color: '#f0f0f5' }}>Share</Text>
      </View>

      <ShareSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        contentId={contentId}
        title={title}
      />
    </>
  );
}
