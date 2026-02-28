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

