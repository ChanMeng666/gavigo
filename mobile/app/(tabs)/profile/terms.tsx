import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function Section({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
        {number}. {title}
      </Text>
      <Text style={{ color: '#a0a0b8', fontSize: 14, lineHeight: 22 }}>{body}</Text>
    </View>
  );
}

export default function TermsScreen() {
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
          onPress={() => router.replace('/(tabs)/profile')}
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
          Terms of Service
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#555568', fontSize: 13, marginBottom: 24 }}>
          Last updated: March 1, 2026
        </Text>

        <Section
          number="1"
          title="Acceptance of Terms"
          body="By accessing and using GAVIGO IRE (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service."
        />
        <Section
          number="2"
          title="Description of Service"
          body="GAVIGO IRE is an AI-driven content orchestration platform that delivers personalized content experiences through intelligent container management and real-time engagement analysis."
        />
        <Section
          number="3"
          title="User Accounts"
          body="You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use."
        />
        <Section
          number="4"
          title="User Content"
          body="You retain ownership of content you submit through the Service. By submitting content, you grant GAVIGO a non-exclusive license to use, display, and distribute your content within the platform."
        />
        <Section
          number="5"
          title="Acceptable Use"
          body="You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited activities include but are not limited to: harassment, spamming, and distribution of malicious content."
        />
        <Section
          number="6"
          title="Privacy"
          body="Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy."
        />
        <Section
          number="7"
          title="Disclaimer"
          body={'The Service is provided "as is" without warranties of any kind, either express or implied.'}
        />
        <Section
          number="8"
          title="Contact"
          body="For questions about these Terms, please contact support@gavigo.com."
        />
      </ScrollView>
    </View>
  );
}
