// Web-specific GameEmbed - uses iframe instead of react-native-webview
// Metro bundler automatically picks .web.tsx over .tsx for web builds
import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

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
        <View className="absolute inset-0 items-center justify-center" style={{ zIndex: 10 }}>
          <ActivityIndicator color="white" size="large" />
          <Text className="text-white/60 text-sm mt-3">Loading game...</Text>
        </View>
      )}

      {isVisible &&
        React.createElement('iframe', {
          src: gameUrl,
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: isLoaded ? 1 : 0,
          },
          onLoad: () => setIsLoaded(true),
          title: 'Game',
          allow: 'autoplay; fullscreen',
          sandbox: 'allow-scripts allow-same-origin allow-popups',
        })}

      <View
        className="absolute bottom-2 left-0 right-0 items-center"
        pointerEvents="none"
      >
        <View className="px-3 py-1 rounded-full bg-black/50">
          <Text className="text-white/70 text-[10px]">Tap to play</Text>
        </View>
      </View>
    </View>
  );
}
