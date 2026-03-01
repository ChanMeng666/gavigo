import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function FeatureItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <Ionicons name={icon} size={18} color="#7c3aed" />
      <Text style={{ color: '#a0a0b8', fontSize: 14, marginLeft: 10, flex: 1, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}

function LinkItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1e30',
      }}
    >
      <Ionicons name={icon} size={20} color="#555568" />
      <Text style={{ color: '#e4e4e9', fontSize: 15, marginLeft: 12, flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#555568" />
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e18' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingTop: insets.top + 8,
          borderBottomWidth: 1,
          borderBottomColor: '#1e1e30',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#e4e4e9" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#e4e4e9',
            fontSize: 17,
            fontWeight: '600',
          }}
          accessibilityRole="header"
        >
          About GAVIGO
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Logo & Version */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image
            source={require('@/assets/gavigo-logo.png')}
            style={{ width: 100, height: 100, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text style={{ color: '#e4e4e9', fontSize: 24, fontWeight: '700' }}>
            GAVIGO IRE
          </Text>
          <Text style={{ color: '#555568', fontSize: 14, marginTop: 4 }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Description */}
        <Text
          style={{
            color: '#a0a0b8',
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
          }}
        >
          Instant Reality Exchange — AI-driven container orchestration
          that adapts content delivery in real-time based on user
          engagement and predictive intelligence.
        </Text>

        {/* Key Features */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
          Key Features
        </Text>
        <FeatureItem icon="flash-outline" text="Real-time AI content orchestration" />
        <FeatureItem icon="game-controller-outline" text="Instant game streaming with zero latency" />
        <FeatureItem icon="analytics-outline" text="Predictive engagement scoring" />
        <FeatureItem icon="people-outline" text="Social features — likes, comments, follows" />
        <FeatureItem icon="cube-outline" text="Intelligent container state management" />

        {/* Links */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 8 }}>
          Links
        </Text>
        <LinkItem
          icon="globe-outline"
          label="Website"
          onPress={() => Linking.openURL('https://ire.gavigo.com')}
        />
        <LinkItem
          icon="mail-outline"
          label="Contact Support"
          onPress={() => Linking.openURL('mailto:support@gavigo.com')}
        />
        <LinkItem
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => router.push('/(tabs)/profile/terms' as any)}
        />

        {/* Copyright */}
        <Text style={{ color: '#555568', fontSize: 12, textAlign: 'center', marginTop: 32, marginBottom: 16 }}>
          {'\u00A9'} 2026 GAVIGO. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}
