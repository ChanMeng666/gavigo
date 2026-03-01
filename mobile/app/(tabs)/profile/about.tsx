import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

      {/* Content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: 'rgba(124,58,237,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Ionicons name="cube" size={40} color="#7c3aed" />
        </View>

        <Text style={{ color: '#e4e4e9', fontSize: 24, fontWeight: '700' }}>
          GAVIGO IRE
        </Text>
        <Text style={{ color: '#555568', fontSize: 14, marginTop: 4 }}>
          Version 1.0.0
        </Text>

        <Text
          style={{
            color: '#a0a0b8',
            fontSize: 15,
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 22,
          }}
        >
          Instant Reality Exchange — AI-driven container orchestration
          that adapts content delivery in real-time based on user
          engagement and predictive intelligence.
        </Text>

        <Text style={{ color: '#555568', fontSize: 12, marginTop: 32 }}>
          2026 GAVIGO. All rights reserved.
        </Text>
      </View>
    </View>
  );
}
