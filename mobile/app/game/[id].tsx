import { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GameEmbed } from '@/components/feed/GameEmbed';
import { LikeButton } from '@/components/social/LikeButton';
import { CommentButton } from '@/components/social/CommentButton';
import { ShareButton } from '@/components/social/ShareButton';
import { CommentSheet } from '@/components/social/CommentSheet';
import { useSocialSubscriptions } from '@/hooks/useSocialSubscriptions';
import { STUDIOS, gameSupabaseIdMap } from '@/data/games';

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
  const bottomSheetRef = useRef<{ present: () => void; dismiss: () => void } | null>(null);

  const gameSlug = id ?? '';
  const gameTitle = gameTitleMap[gameSlug] ?? 'Game';
  const supabaseId = gameSupabaseIdMap[gameSlug];

  // Subscribe to real-time social updates if we have a Supabase UUID
  useSocialSubscriptions(supabaseId ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e18' }}>
      <GameEmbed deploymentName={gameSlug} isVisible={true} />

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

      {/* Right-side social action buttons */}
      {supabaseId ? (
        <View
          style={{
            position: 'absolute',
            right: 8,
            bottom: insets.bottom + 80,
            alignItems: 'center',
            gap: 18,
          }}
        >
          <LikeButton contentId={supabaseId} initialCount={0} />
          <CommentButton contentId={supabaseId} initialCount={0} />
          <ShareButton contentId={gameSlug} title={gameTitle} contentType="game" />
        </View>
      ) : null}

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
        pointerEvents="box-none"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="game-controller" size={18} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {gameTitle}
          </Text>
        </View>
      </View>

      {/* Comment sheet */}
      {supabaseId ? (
        <CommentSheet contentId={supabaseId} bottomSheetRef={bottomSheetRef} />
      ) : null}
    </View>
  );
}
