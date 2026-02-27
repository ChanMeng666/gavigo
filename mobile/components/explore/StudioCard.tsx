import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StudioGame {
  id: string;
  title: string;
  emoji: string;
}

export interface Studio {
  name: string;
  emoji: string;
  tagline: string;
  accentColor: string;
  games: StudioGame[];
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
              {/* Thumbnail placeholder with emoji */}
              <View
                style={{
                  height: 72,
                  backgroundColor: studio.accentColor + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 28 }}>{game.emoji}</Text>
              </View>
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
      { id: 'game-2048', title: '2048', emoji: '\u{1F522}' },
      { id: 'game-poker-quest', title: 'Poker Quest', emoji: '\u{1F0CF}' },
    ],
  },
  {
    name: 'Arcade Zone',
    emoji: '\u{1F579}\uFE0F',
    tagline: 'Fast-paced arcade action',
    accentColor: '#f87171',
    games: [
      { id: 'game-space-waves', title: 'Space Waves', emoji: '\u{1F680}' },
      { id: 'game-drift-boss', title: 'Drift Boss', emoji: '\u{1F3CE}\uFE0F' },
      { id: 'game-fray-fight', title: 'Fray Fight', emoji: '\u{1F94A}' },
    ],
  },
  {
    name: 'Casual Play',
    emoji: '\u{2728}',
    tagline: 'Quick fun, play & move on',
    accentColor: '#34d399',
    games: [
      { id: 'game-slice-master', title: 'Slice Master', emoji: '\u{1F52A}' },
      { id: 'game-tiny-fishing', title: 'Tiny Fishing', emoji: '\u{1F3A3}' },
    ],
  },
  {
    name: 'Idle Kingdom',
    emoji: '\u{1F451}',
    tagline: 'Idle & incremental adventures',
    accentColor: '#fbbf24',
    games: [
      { id: 'game-clicker-heroes', title: 'Clicker Heroes', emoji: '\u{2694}\uFE0F' },
      { id: 'game-mrmine', title: 'Mr.Mine', emoji: '\u{26CF}\uFE0F' },
      { id: 'game-grindcraft', title: 'Grindcraft', emoji: '\u{1F528}' },
    ],
  },
];
