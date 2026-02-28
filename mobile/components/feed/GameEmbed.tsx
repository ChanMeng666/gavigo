import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SkeletonLoader, EmptyState, Chip } from '@/components/ui';

const gameUrlMap: Record<string, string> = {
  'game-2048': 'https://games.crazygames.com/en_US/2048/index.html',
  'game-slice-master': 'https://games.crazygames.com/en_US/slice-master/index.html',
  'game-space-waves': 'https://games.crazygames.com/en_US/space-waves/index.html',
  'game-drift-boss': 'https://games.crazygames.com/en_US/drift-boss/index.html',
  'game-tiny-fishing': 'https://games.crazygames.com/en_US/tiny-fishing/index.html',
  'game-stickman-hook': 'https://games.crazygames.com/en_US/stickman-hook/index.html',
  'game-moto-x3m': 'https://games.crazygames.com/en_US/moto-x3m/index.html',
  'game-paper-io-2': 'https://games.crazygames.com/en_US/paper-io-2/index.html',
  'game-temple-of-boom': 'https://games.crazygames.com/en_US/temple-of-boom/index.html',
  'game-monkey-mart': 'https://games.crazygames.com/en_US/monkey-mart/index.html',
  'game-tunnel-rush': 'https://games.crazygames.com/en_US/tunnel-rush/index.html',
  'game-narrow-one': 'https://games.crazygames.com/en_US/narrow-one/index.html',
  'game-smash-karts': 'https://games.crazygames.com/en_US/smash-karts/index.html',
};

interface GameEmbedProps {
  deploymentName: string;
  isVisible: boolean;
}

export function GameEmbed({ deploymentName, isVisible }: GameEmbedProps) {
  const gameUrl = gameUrlMap[deploymentName];
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const hintOpacity = useSharedValue(1);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        hintOpacity.value = withTiming(0, { duration: 300 });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hintOpacity]);

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  if (!gameUrl || hasError) {
    return (
      <View className="absolute inset-0 bg-bg-base items-center justify-center">
        <EmptyState
          icon="alert-circle"
          title="Game unavailable"
          subtitle="This game couldn't be loaded"
        />
      </View>
    );
  }

  return (
    <View className="absolute inset-0 bg-bg-base">
      {!isLoaded && (
        <View className="absolute inset-0 items-center justify-center" style={{ zIndex: 10 }}>
          <SkeletonLoader variant="rect" height="100%" />
          <View className="absolute items-center">
            <Ionicons name="game-controller" size={32} color="#8e8ea0" />
            <Text className="text-caption text-text-secondary mt-2">Loading game...</Text>
          </View>
        </View>
      )}

      {isVisible && (
        <WebView
          source={{ uri: gameUrl }}
          style={{ flex: 1, opacity: isLoaded ? 1 : 0 }}
          onLoadEnd={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          scalesPageToFit
        />
      )}

      {/* Tap to play hint */}
      {isLoaded && (
        <Animated.View
          style={[
            hintStyle,
            {
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              alignItems: 'center',
            },
          ]}
          pointerEvents="none"
        >
          <Chip label="Tap to play" leftIcon="game-controller" compact />
        </Animated.View>
      )}
    </View>
  );
}
