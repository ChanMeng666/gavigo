import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendUserAction } from '@/services/wsEvents';

function ToggleItem({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1e30',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: '#e4e4e9', fontSize: 15 }}>{label}</Text>
        <Text style={{ color: '#555568', fontSize: 13, marginTop: 2 }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#2a2a40', true: 'rgba(124,58,237,0.4)' }}
        thumbColor={value ? '#7c3aed' : '#555568'}
      />
    </View>
  );
}

function ActionItem({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1e30',
      }}
    >
      <Ionicons name={icon} size={20} color="#555568" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: '#e4e4e9', fontSize: 15 }}>{label}</Text>
        <Text style={{ color: '#555568', fontSize: 13, marginTop: 2 }}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#555568" />
    </TouchableOpacity>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [publicProfile, setPublicProfile] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [usageAnalytics, setUsageAnalytics] = useState(true);
  const [personalizedContent, setPersonalizedContent] = useState(true);

  const handleToggle = (setting: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    sendUserAction({ action: 'privacy_toggle', screen: 'privacy', value: `${setting}:${value}` });
  };

  const showComingSoon = (feature: string) => {
    const message = `${feature} is coming soon.`;
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Coming Soon', message);
    }
  };

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
          Privacy & Security
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Profile */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Profile
        </Text>
        <ToggleItem
          label="Public Profile"
          description="Allow others to see your profile"
          value={publicProfile}
          onToggle={(v) => handleToggle('public_profile', v, setPublicProfile)}
        />
        <ToggleItem
          label="Show Activity Status"
          description="Let others see when you're active"
          value={activityStatus}
          onToggle={(v) => handleToggle('activity_status', v, setActivityStatus)}
        />

        {/* Data */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 28, marginBottom: 8 }}>
          Data
        </Text>
        <ToggleItem
          label="Usage Analytics"
          description="Help improve GAVIGO with anonymous data"
          value={usageAnalytics}
          onToggle={(v) => handleToggle('usage_analytics', v, setUsageAnalytics)}
        />
        <ToggleItem
          label="Personalized Content"
          description="Use engagement data for recommendations"
          value={personalizedContent}
          onToggle={(v) => handleToggle('personalized_content', v, setPersonalizedContent)}
        />

        {/* Security */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 28, marginBottom: 8 }}>
          Security
        </Text>
        <ActionItem
          icon="key-outline"
          label="Change Password"
          description="Update your account password"
          onPress={() => showComingSoon('Change Password')}
        />
        <ActionItem
          icon="shield-checkmark-outline"
          label="Two-Factor Authentication"
          description="Add an extra layer of security"
          onPress={() => showComingSoon('Two-Factor Authentication')}
        />
      </ScrollView>
    </View>
  );
}
