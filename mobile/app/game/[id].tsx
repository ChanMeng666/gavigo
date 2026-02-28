import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GameEmbed } from '@/components/feed/GameEmbed';
import { STUDIOS } from '@/data/games';

// Build a lookup from game ID to title from STUDIOS data
const gameTitleMap: Record<string, string> = {};
for (const studio of STUDIOS) {
  for (const game of studio.games) {
    gameTitleMap[game.id] = game.title;
  }
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const gameTitle = gameTitleMap[id ?? ''] ?? 'Game';

  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e18' }}>
      <GameEmbed deploymentName={id ?? ''} isVisible={true} />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 12,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Bottom title bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + 8,
          paddingTop: 24,
          paddingHorizontal: 16,
          backgroundColor: 'rgba(0,0,0,0.6)',
        }}
        pointerEvents="none"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="game-controller" size={18} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {gameTitle}
          </Text>
        </View>
      </View>
    </View>
  );
}
