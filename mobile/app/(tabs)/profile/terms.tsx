import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
          Terms of Service
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={{ color: '#a0a0b8', fontSize: 14, lineHeight: 22 }}>
          {'Last updated: March 1, 2026\n\n'}
          {'1. Acceptance of Terms\n\n'}
          {'By accessing and using GAVIGO IRE ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.\n\n'}
          {'2. Description of Service\n\n'}
          {'GAVIGO IRE is an AI-driven content orchestration platform that delivers personalized content experiences through intelligent container management and real-time engagement analysis.\n\n'}
          {'3. User Accounts\n\n'}
          {'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.\n\n'}
          {'4. User Content\n\n'}
          {'You retain ownership of content you submit through the Service. By submitting content, you grant GAVIGO a non-exclusive license to use, display, and distribute your content within the platform.\n\n'}
          {'5. Acceptable Use\n\n'}
          {'You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited activities include but are not limited to: harassment, spamming, and distribution of malicious content.\n\n'}
          {'6. Privacy\n\n'}
          {'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy.\n\n'}
          {'7. Disclaimer\n\n'}
          {'The Service is provided "as is" without warranties of any kind, either express or implied.\n\n'}
          {'8. Contact\n\n'}
          {'For questions about these Terms, please contact support@gavigo.com.'}
        </Text>
      </ScrollView>
    </View>
  );
}
