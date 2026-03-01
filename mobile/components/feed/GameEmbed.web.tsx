// Web-specific GameEmbed - uses iframe instead of react-native-webview
// Metro bundler automatically picks .web.tsx over .tsx for web builds
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonLoader, EmptyState } from '@/components/ui';
import { gameUrlMap } from '@/data/games';

interface GameEmbedProps {
  deploymentName: string;
  isVisible: boolean;
}

export function GameEmbed({ deploymentName, isVisible }: GameEmbedProps) {
  const gameUrl = gameUrlMap[deploymentName];
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Loading timeout
  useEffect(() => {
    if (isLoaded || !isVisible || !gameUrl) return;
    const timer = setTimeout(() => {
      if (!isLoaded) setHasError(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isVisible, isLoaded, gameUrl]);

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

    </View>
  );
}
