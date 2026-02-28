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
      { id: 'game-uno-online', title: 'Uno Online', emoji: '\u{1F0CF}', thumbnail: '' },
      { id: 'game-chess', title: 'Chess', emoji: '\u{265F}\uFE0F', thumbnail: '' },
      { id: 'game-checkers', title: 'Checkers', emoji: '\u{1FA78}', thumbnail: '' },
      { id: 'game-backgammon', title: 'Backgammon', emoji: '\u{1F3B2}', thumbnail: '' },
      { id: 'game-mahjong', title: 'Mahjong', emoji: '\u{1F004}', thumbnail: '' },
      { id: 'game-master-chess', title: 'Master Chess', emoji: '\u{265A}', thumbnail: '' },
      { id: 'game-mancala', title: 'Mancala', emoji: '\u{1F7E4}', thumbnail: '' },
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
      { id: 'game-geometry-dash', title: 'Geometry Dash', emoji: '\u{25B6}\uFE0F', thumbnail: '' },
      { id: 'game-color-tunnel', title: 'Color Tunnel', emoji: '\u{1F308}', thumbnail: '' },
      { id: 'game-helix-jump', title: 'Helix Jump', emoji: '\u{1F504}', thumbnail: '' },
      { id: 'game-stacky-bird', title: 'Stacky Bird', emoji: '\u{1F426}', thumbnail: '' },
      { id: 'game-jet-rush', title: 'Jet Rush', emoji: '\u{2708}\uFE0F', thumbnail: '' },
      { id: 'game-count-masters', title: 'Count Masters', emoji: '\u{1F3C3}', thumbnail: '' },
      { id: 'game-man-runner-2048', title: 'Man Runner 2048', emoji: '\u{1F3C3}\u200D\u2642\uFE0F', thumbnail: '' },
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
      { id: 'game-crazy-fish', title: 'Crazy Fish', emoji: '\u{1F420}', thumbnail: '' },
      { id: 'game-papas-pizzeria', title: "Papa's Pizzeria", emoji: '\u{1F355}', thumbnail: '' },
      { id: 'game-getting-over-it', title: 'Getting Over It', emoji: '\u{1F3D4}\uFE0F', thumbnail: '' },
      { id: 'game-friday-night-funkin', title: 'Friday Night Funkin', emoji: '\u{1F3A4}', thumbnail: '' },
      { id: 'game-bubble-blast', title: 'Bubble Blast', emoji: '\u{1FAE7}', thumbnail: '' },
      { id: 'game-fireboy-watergirl', title: 'Fireboy & Watergirl', emoji: '\u{1F525}', thumbnail: '' },
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
      { id: 'game-night-city-racing', title: 'Night City Racing', emoji: '\u{1F30C}', thumbnail: '' },
      { id: 'game-mx-offroad', title: 'MX Offroad', emoji: '\u{1F6E3}\uFE0F', thumbnail: '' },
    ],
  },
  {
    name: 'Idle Kingdom',
    emoji: '\u{1F451}',
    tagline: 'Idle & incremental adventures',
    accentColor: '#a78bfa',
    games: [
      { id: 'game-monkey-mart', title: 'Monkey Mart', emoji: '\u{1F412}', thumbnail: 'https://imgs.crazygames.com/monkey-mart_1x1/20231122033835/monkey-mart_1x1-cover?format=auto&quality=100&metadata=none&width=400' },
      { id: 'game-clicker-heroes', title: 'Clicker Heroes', emoji: '\u{1F5E1}\uFE0F', thumbnail: '' },
      { id: 'game-mr-mine', title: 'Mr. Mine', emoji: '\u{26CF}\uFE0F', thumbnail: '' },
      { id: 'game-doge-miner', title: 'Doge Miner', emoji: '\u{1F436}', thumbnail: '' },
      { id: 'game-doge-miner-2', title: 'Doge Miner 2', emoji: '\u{1F680}', thumbnail: '' },
      { id: 'game-planet-clicker', title: 'Planet Clicker', emoji: '\u{1F30D}', thumbnail: '' },
      { id: 'game-race-clicker', title: 'Race Clicker', emoji: '\u{1F3C1}', thumbnail: '' },
      { id: 'game-idle-inventor', title: 'Idle Inventor', emoji: '\u{1F4A1}', thumbnail: '' },
    ],
  },
  {
    name: 'FPS Arena',
    emoji: '\u{1F52B}',
    tagline: 'First-person shooter action',
    accentColor: '#ef4444',
    games: [
      { id: 'game-shell-shockers', title: 'Shell Shockers', emoji: '\u{1F95A}', thumbnail: '' },
      { id: 'game-kour-io', title: 'Kour.io', emoji: '\u{1F3AF}', thumbnail: '' },
      { id: 'game-voxiom-io', title: 'Voxiom.io', emoji: '\u{1F7E9}', thumbnail: '' },
      { id: 'game-bullet-force', title: 'Bullet Force', emoji: '\u{1F4A5}', thumbnail: '' },
      { id: 'game-skillwarz', title: 'SkillWarz', emoji: '\u{2694}\uFE0F', thumbnail: '' },
      { id: 'game-buildnow-gg', title: 'BuildNow GG', emoji: '\u{1F3D7}\uFE0F', thumbnail: '' },
      { id: 'game-1v1-lol', title: '1v1.LOL', emoji: '\u{1F3AE}', thumbnail: '' },
      { id: 'game-pixel-warfare', title: 'Pixel Warfare', emoji: '\u{1F4BB}', thumbnail: '' },
    ],
  },
  {
    name: 'IO World',
    emoji: '\u{1F310}',
    tagline: 'Multiplayer .io games',
    accentColor: '#06b6d4',
    games: [
      { id: 'game-agar-io', title: 'Agar.io', emoji: '\u{1F7E2}', thumbnail: '' },
      { id: 'game-evowars-io', title: 'EvoWars.io', emoji: '\u{2694}\uFE0F', thumbnail: '' },
      { id: 'game-bloxd-io', title: 'Bloxd.io', emoji: '\u{1F7E6}', thumbnail: '' },
      { id: 'game-cubes-2048', title: 'Cubes 2048.io', emoji: '\u{1F7E8}', thumbnail: '' },
      { id: 'game-diep-io', title: 'Diep.io', emoji: '\u{1F534}', thumbnail: '' },
      { id: 'game-zombs-royale', title: 'Zombs Royale', emoji: '\u{1F9DF}', thumbnail: '' },
      { id: 'game-snake-io', title: 'Snake.io', emoji: '\u{1F40D}', thumbnail: '' },
      { id: 'game-skribbl-io', title: 'Skribbl.io', emoji: '\u{1F58D}\uFE0F', thumbnail: '' },
      { id: 'game-lol-beans', title: 'LOL Beans', emoji: '\u{1FAD8}', thumbnail: '' },
      { id: 'game-fly-or-die', title: 'Fly or Die', emoji: '\u{1F985}', thumbnail: '' },
    ],
  },
  {
    name: 'Sports Hub',
    emoji: '\u{26BD}',
    tagline: 'Sports & competition',
    accentColor: '#f97316',
    games: [
      { id: 'game-basketbros', title: 'BasketBros', emoji: '\u{1F3C0}', thumbnail: '' },
      { id: 'game-basketball-stars', title: 'Basketball Stars', emoji: '\u{26F9}\uFE0F', thumbnail: '' },
      { id: 'game-goal-gang', title: 'Goal Gang', emoji: '\u{26BD}', thumbnail: '' },
      { id: 'game-basket-random', title: 'Basket Random', emoji: '\u{1F3C0}', thumbnail: '' },
      { id: 'game-8-ball-pool', title: '8 Ball Pool', emoji: '\u{1F3B1}', thumbnail: '' },
      { id: 'game-mini-golf', title: 'Mini Golf', emoji: '\u{26F3}', thumbnail: '' },
      { id: 'game-crazy-flips', title: 'Crazy Flips 3D', emoji: '\u{1F938}', thumbnail: '' },
    ],
  },
  {
    name: 'Battle Arena',
    emoji: '\u{2694}\uFE0F',
    tagline: 'PvP combat & strategy',
    accentColor: '#dc2626',
    games: [
      { id: 'game-rooftop-snipers', title: 'Rooftop Snipers', emoji: '\u{1F3E2}', thumbnail: '' },
      { id: 'game-getaway-shootout', title: 'Getaway Shootout', emoji: '\u{1F3C3}', thumbnail: '' },
      { id: 'game-ragdoll-archers', title: 'Ragdoll Archers', emoji: '\u{1F3F9}', thumbnail: '' },
      { id: 'game-stickman-clash', title: 'Stickman Clash', emoji: '\u{1F93A}', thumbnail: '' },
      { id: 'game-tank-stars', title: 'Tank Stars', emoji: '\u{1F680}', thumbnail: '' },
      { id: 'game-castle-craft', title: 'Castle Craft', emoji: '\u{1F3F0}', thumbnail: '' },
      { id: 'game-iron-legion', title: 'Iron Legion', emoji: '\u{1F916}', thumbnail: '' },
      { id: 'game-hex-empire', title: 'Hex Empire', emoji: '\u{1F5FA}\uFE0F', thumbnail: '' },
      { id: 'game-rocket-bot-royale', title: 'Rocket Bot Royale', emoji: '\u{1F680}', thumbnail: '' },
      { id: 'game-horde-killer', title: 'Horde Killer', emoji: '\u{1F9DF}\u200D\u2642\uFE0F', thumbnail: '' },
      { id: 'game-superhot', title: 'SuperHot', emoji: '\u{1F525}', thumbnail: '' },
      { id: 'game-time-shooter-2', title: 'Time Shooter 2', emoji: '\u{23F1}\uFE0F', thumbnail: '' },
      { id: 'game-street-fighter-2', title: 'Street Fighter 2', emoji: '\u{1F94A}', thumbnail: '' },
    ],
  },
];
