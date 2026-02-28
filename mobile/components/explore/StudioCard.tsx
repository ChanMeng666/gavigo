import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StudioGame {
  id: string;
  title: string;
  emoji: string;
  thumbnail: string;
}

export interface Studio {
  name: string;
  emoji: string;
  tagline: string;
  accentColor: string;
  games: StudioGame[];
}

function GameThumbnail({ game, accentColor }: { game: StudioGame; accentColor: string }) {
  const [failed, setFailed] = useState(false);

  if (!game.thumbnail || failed) {
    return (
      <View
        style={{
          height: 72,
          backgroundColor: accentColor + '15',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 28 }}>{game.emoji}</Text>
      </View>
    );
  }

  return (
    <View style={{ height: 72, backgroundColor: accentColor + '15' }}>
      <Image
        source={{ uri: game.thumbnail }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

interface StudioCardProps {
  studio: Studio;
  onGamePress: (gameId: string) => void;
}

export function StudioCard({ studio, onGamePress }: StudioCardProps) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a40',
      }}
    >
      <View style={{ padding: 16, backgroundColor: '#1a1a2e' }}>
        {/* Studio header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: studio.accentColor + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{studio.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#f0f0f5',
                fontSize: 15,
                fontWeight: '600',
                lineHeight: 20,
              }}
            >
              {studio.name}
            </Text>
            <Text
              style={{
                color: '#8e8ea0',
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              {studio.tagline}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#555568" />
        </View>

        {/* Game row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {studio.games.map((game) => (
            <TouchableOpacity
              key={game.id}
              onPress={() => onGamePress(game.id)}
              activeOpacity={0.7}
              style={{
                width: 120,
                backgroundColor: '#0e0e18',
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#2a2a40',
              }}
            >
              {/* Thumbnail */}
              <GameThumbnail game={game} accentColor={studio.accentColor} />
              {/* Game info */}
              <View style={{ padding: 8 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#f0f0f5',
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                >
                  {game.title}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: studio.accentColor + '20',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Ionicons
                    name="play"
                    size={10}
                    color={studio.accentColor}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={{
                      color: studio.accentColor,
                      fontSize: 10,
                      fontWeight: '600',
                    }}
                  >
                    Play
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export const STUDIOS: Studio[] = [
  {
    name: 'Puzzle Lab',
    emoji: '\u{1F9E9}',
    tagline: 'Brain teasers & number games',
    accentColor: '#60a5fa',
    games: [
      { id: 'game-2048', title: '2048', emoji: '\u{1F522}', thumbnail: 'https://imgs.crazygames.com/games/2048/cover_1x1-1707828857318.png?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-paper-io-2', title: 'Paper.io 2', emoji: '\u{1F4DD}', thumbnail: 'https://imgs.crazygames.com/paper-io-2_1x1/20250214024144/paper-io-2_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
    ],
  },
  {
    name: 'Arcade Zone',
    emoji: '\u{1F579}\uFE0F',
    tagline: 'Fast-paced arcade action',
    accentColor: '#f87171',
    games: [
      { id: 'game-space-waves', title: 'Space Waves', emoji: '\u{1F680}', thumbnail: 'https://imgs.crazygames.com/space-waves_1x1/20241203031650/space-waves_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-drift-boss', title: 'Drift Boss', emoji: '\u{1F3CE}\uFE0F', thumbnail: 'https://imgs.crazygames.com/drift-boss_1x1/20260209092420/drift-boss_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-tunnel-rush', title: 'Tunnel Rush', emoji: '\u{1F300}', thumbnail: 'https://imgs.crazygames.com/tunnel-rush_1x1/20231122034041/tunnel-rush_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-temple-of-boom', title: 'Temple of Boom', emoji: '\u{1F4A5}', thumbnail: 'https://imgs.crazygames.com/temple-of-boom_1x1/20231122034004/temple-of-boom_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
    ],
  },
  {
    name: 'Casual Play',
    emoji: '\u{2728}',
    tagline: 'Quick fun, play & move on',
    accentColor: '#34d399',
    games: [
      { id: 'game-slice-master', title: 'Slice Master', emoji: '\u{1F52A}', thumbnail: 'https://imgs.crazygames.com/slice-master_1x1/20240731033229/slice-master_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-tiny-fishing', title: 'Tiny Fishing', emoji: '\u{1F3A3}', thumbnail: 'https://imgs.crazygames.com/games/tiny-fishing/cover_1x1-1707829871792.png?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-stickman-hook', title: 'Stickman Hook', emoji: '\u{1F3A3}', thumbnail: 'https://imgs.crazygames.com/stickman-hook_1x1/20250522103710/stickman-hook_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
    ],
  },
  {
    name: 'Racing & Karts',
    emoji: '\u{1F3CE}\uFE0F',
    tagline: 'Speed, stunts & competition',
    accentColor: '#fbbf24',
    games: [
      { id: 'game-moto-x3m', title: 'Moto X3M', emoji: '\u{1F3CD}\uFE0F', thumbnail: 'https://imgs.crazygames.com/moto-x3m_1x1/20231122033955/moto-x3m_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-smash-karts', title: 'Smash Karts', emoji: '\u{1F697}', thumbnail: 'https://imgs.crazygames.com/smash-karts_1x1/20260210123937/smash-karts_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-narrow-one', title: 'Narrow One', emoji: '\u{1F3F9}', thumbnail: 'https://imgs.crazygames.com/auto-covers/narrow-one_1x1?format=auto&quality=100&metadata=none&width=400' },
    ],
  },
  {
    name: 'Idle Kingdom',
    emoji: '\u{1F451}',
    tagline: 'Idle & incremental adventures',
    accentColor: '#a78bfa',
    games: [
      { id: 'game-monkey-mart', title: 'Monkey Mart', emoji: '\u{1F412}', thumbnail: 'https://imgs.crazygames.com/monkey-mart_1x1/20231122033835/monkey-mart_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
    ],
  },
];
