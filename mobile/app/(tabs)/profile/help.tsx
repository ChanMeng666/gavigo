import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#16162a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '500', flex: 1 }}>
          {question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#555568"
        />
      </View>
      {expanded && (
        <Text style={{ color: '#a0a0b8', fontSize: 14, lineHeight: 21, marginTop: 12 }}>
          {answer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
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
          Help & Support
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* FAQ Section */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
          Frequently Asked Questions
        </Text>

        <FAQItem
          question="What is GAVIGO IRE?"
          answer="GAVIGO IRE (Instant Reality Exchange) is an AI-driven content orchestration platform. It delivers personalized content experiences through intelligent container management, adapting in real-time based on your engagement patterns."
        />
        <FAQItem
          question="How does AI content delivery work?"
          answer="Our AI engine monitors engagement signals like focus time, scroll patterns, and interactions. It uses a weighted scoring system to predict what content you'll enjoy and pre-loads it into warm containers for instant delivery."
        />
        <FAQItem
          question="How do I change my profile?"
          answer="Navigate to the Profile tab, then tap 'Edit Profile'. You can change your username, bio, and profile photo. Changes are saved to your account immediately."
        />
        <FAQItem
          question="Is my data secure?"
          answer="Yes. We use Firebase Authentication for secure sign-in, and all data is transmitted over encrypted connections. Your engagement data is used solely to improve your content experience."
        />

        {/* Contact Section */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 16 }}>
          Contact Us
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:support@gavigo.com')}
          activeOpacity={0.7}
          style={{
            backgroundColor: '#16162a',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name="mail-outline" size={22} color="#7c3aed" />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '500' }}>Email Support</Text>
            <Text style={{ color: '#555568', fontSize: 13, marginTop: 2 }}>support@gavigo.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://ire.gavigo.com')}
          activeOpacity={0.7}
          style={{
            backgroundColor: '#16162a',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name="globe-outline" size={22} color="#7c3aed" />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '500' }}>Website</Text>
            <Text style={{ color: '#555568', fontSize: 13, marginTop: 2 }}>ire.gavigo.com</Text>
          </View>
        </TouchableOpacity>

        {/* App Info */}
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <Text style={{ color: '#555568', fontSize: 13 }}>GAVIGO IRE v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
