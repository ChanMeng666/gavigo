import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const gameUrlMap: Record<string, string> = {
  'game-clicker-heroes': 'https://cdn.clickerheroes.com/gamebuild/index.php',
  'game-mrmine': 'https://mrmine.com/game/',
  'game-poker-quest': 'https://playsaurus.com/kongPokerQuest63/',
  'game-grindcraft': 'https://grindcraft.com/game.php',
  'game-fray-fight': 'https://frayfight.com/game/',
};

interface GameEmbedProps {
  deploymentName: string;
  isVisible: boolean;
}

export function GameEmbed({ deploymentName, isVisible }: GameEmbedProps) {
  const gameUrl = gameUrlMap[deploymentName];
  const [isLoaded, setIsLoaded] = useState(false);

  if (!gameUrl) {
    return (
      <View className="absolute inset-0 bg-black items-center justify-center">
        <Text className="text-white/50">Game not available</Text>
      </View>
    );
  }

  return (
    <View className="absolute inset-0 bg-black">
      {!isLoaded && (
        <View className="absolute inset-0 items-center justify-center z-10">
          <ActivityIndicator color="white" size="large" />
          <Text className="text-white/60 text-sm mt-3">Loading game...</Text>
        </View>
      )}

      {isVisible && (
        <WebView
          source={{ uri: gameUrl }}
          style={{ flex: 1, opacity: isLoaded ? 1 : 0 }}
          onLoadEnd={() => setIsLoaded(true)}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
          scalesPageToFit
        />
      )}

      {/* Controls hint */}
      <View className="absolute bottom-2 left-0 right-0 items-center" pointerEvents="none">
        <View className="px-3 py-1 rounded-full bg-black/50">
          <Text className="text-white/70 text-[10px]">Tap to play</Text>
        </View>
      </View>
    </View>
  );
}
