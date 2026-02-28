// Web-specific GameEmbed - uses iframe instead of react-native-webview
// Metro bundler automatically picks .web.tsx over .tsx for web builds
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
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
  // FPS Arena
  'game-shell-shockers': 'https://games.crazygames.com/en_US/shellshockersio/index.html',
  'game-kour-io': 'https://games.crazygames.com/en_US/kour-io/index.html',
  'game-voxiom-io': 'https://games.crazygames.com/en_US/voxiom-io/index.html',
  'game-bullet-force': 'https://games.crazygames.com/en_US/bullet-force-multiplayer/index.html',
  'game-skillwarz': 'https://games.crazygames.com/en_US/skillwarz/index.html',
  'game-buildnow-gg': 'https://games.crazygames.com/en_US/buildnow-gg/index.html',
  'game-1v1-lol': 'https://games.crazygames.com/en_US/1v1lol/index.html',
  'game-pixel-warfare': 'https://games.crazygames.com/en_US/pixel-warfare/index.html',
  // Arcade Zone
  'game-geometry-dash': 'https://games.crazygames.com/en_US/geometry-dash-online/index.html',
  'game-color-tunnel': 'https://games.crazygames.com/en_US/color-tunnel/index.html',
  'game-helix-jump': 'https://games.crazygames.com/en_US/helix-jump/index.html',
  'game-stacky-bird': 'https://games.crazygames.com/en_US/stacky-bird/index.html',
  'game-jet-rush': 'https://games.crazygames.com/en_US/jet-rush/index.html',
  'game-count-masters': 'https://games.crazygames.com/en_US/count-masters-stickman-games/index.html',
  'game-man-runner-2048': 'https://games.crazygames.com/en_US/man-runner-2048/index.html',
  // IO World
  'game-agar-io': 'https://games.crazygames.com/en_US/agario/index.html',
  'game-evowars-io': 'https://games.crazygames.com/en_US/evowarsio/index.html',
  'game-bloxd-io': 'https://games.crazygames.com/en_US/bloxdhop-io/index.html',
  'game-cubes-2048': 'https://games.crazygames.com/en_US/cubes-2048-io/index.html',
  'game-diep-io': 'https://games.crazygames.com/en_US/diepio/index.html',
  'game-zombs-royale': 'https://games.crazygames.com/en_US/zombsroyaleio/index.html',
  'game-snake-io': 'https://games.crazygames.com/en_US/snake-io/index.html',
  'game-skribbl-io': 'https://games.crazygames.com/en_US/skribblio/index.html',
  'game-lol-beans': 'https://games.crazygames.com/en_US/lolbeans-io/index.html',
  'game-fly-or-die': 'https://games.crazygames.com/en_US/flyordieio/index.html',
  // Sports Hub
  'game-basketbros': 'https://games.crazygames.com/en_US/basketbros/index.html',
  'game-basketball-stars': 'https://games.crazygames.com/en_US/basketball-stars-2019/index.html',
  'game-goal-gang': 'https://games.crazygames.com/en_US/goal-gang/index.html',
  'game-basket-random': 'https://games.crazygames.com/en_US/basket-random/index.html',
  'game-8-ball-pool': 'https://games.crazygames.com/en_US/8-ball-billiards-classic/index.html',
  'game-mini-golf': 'https://games.crazygames.com/en_US/mini-golf-club/index.html',
  'game-crazy-flips': 'https://games.crazygames.com/en_US/crazy-flips-3d/index.html',
  // Puzzle Lab
  'game-uno-online': 'https://games.crazygames.com/en_US/uno-online/index.html',
  'game-chess': 'https://games.crazygames.com/en_US/chess-free/index.html',
  'game-checkers': 'https://games.crazygames.com/en_US/checkers-free/index.html',
  'game-backgammon': 'https://games.crazygames.com/en_US/classic-backgammon/index.html',
  'game-mahjong': 'https://games.crazygames.com/en_US/mahjongg-solitaire/index.html',
  'game-master-chess': 'https://games.crazygames.com/en_US/master-chess/index.html',
  'game-mancala': 'https://games.crazygames.com/en_US/mancala-classic/index.html',
  // Idle Kingdom
  'game-clicker-heroes': 'https://games.crazygames.com/en_US/clicker-heroes/index.html',
  'game-mr-mine': 'https://games.crazygames.com/en_US/mister-mine/index.html',
  'game-doge-miner': 'https://games.crazygames.com/en_US/doge-miner/index.html',
  'game-doge-miner-2': 'https://games.crazygames.com/en_US/doge-miner-2/index.html',
  'game-planet-clicker': 'https://games.crazygames.com/en_US/planet-clicker/index.html',
  'game-race-clicker': 'https://games.crazygames.com/en_US/race-clicker-tap-tap-game/index.html',
  'game-idle-inventor': 'https://games.crazygames.com/en_US/idle-inventor/index.html',
  // Casual Play
  'game-crazy-fish': 'https://games.crazygames.com/en_US/crazy-fish/index.html',
  'game-papas-pizzeria': 'https://games.crazygames.com/en_US/papas-pizzeria/index.html',
  'game-getting-over-it': 'https://games.crazygames.com/en_US/getting-over-it/index.html',
  'game-friday-night-funkin': 'https://games.crazygames.com/en_US/friday-night-funkin/index.html',
  'game-bubble-blast': 'https://games.crazygames.com/en_US/bubble-blast-pwd/index.html',
  'game-fireboy-watergirl': 'https://games.crazygames.com/en_US/fireboy-and-watergirl-6-fairy-tales/index.html',
  // Racing & Karts
  'game-night-city-racing': 'https://games.crazygames.com/en_US/night-city-racing/index.html',
  'game-mx-offroad': 'https://games.crazygames.com/en_US/mx-offroad-master/index.html',
  // Battle Arena
  'game-rooftop-snipers': 'https://games.crazygames.com/en_US/rooftop-snipers/index.html',
  'game-getaway-shootout': 'https://games.crazygames.com/en_US/getaway-shootout/index.html',
  'game-ragdoll-archers': 'https://games.crazygames.com/en_US/ragdoll-archers/index.html',
  'game-stickman-clash': 'https://games.crazygames.com/en_US/stickman-clash/index.html',
  'game-tank-stars': 'https://games.crazygames.com/en_US/tank-stars-online/index.html',
  'game-castle-craft': 'https://games.crazygames.com/en_US/castle-craft/index.html',
  'game-iron-legion': 'https://games.crazygames.com/en_US/iron-legion/index.html',
  'game-hex-empire': 'https://games.crazygames.com/en_US/hex-empire/index.html',
  'game-rocket-bot-royale': 'https://games.crazygames.com/en_US/rocket-bot-royale/index.html',
  'game-horde-killer': 'https://games.crazygames.com/en_US/horde-killer-you-vs-100/index.html',
  'game-superhot': 'https://games.crazygames.com/en_US/super-hot/index.html',
  'game-time-shooter-2': 'https://games.crazygames.com/en_US/time-shooter-2/index.html',
  'game-street-fighter-2': 'https://games.crazygames.com/en_US/street-fighter-2/index.html',
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

  // Loading timeout
  useEffect(() => {
    if (isLoaded || !isVisible || !gameUrl) return;
    const timer = setTimeout(() => {
      if (!isLoaded) setHasError(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isVisible, isLoaded, gameUrl]);

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
