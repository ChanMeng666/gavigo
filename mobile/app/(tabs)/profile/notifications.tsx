import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
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

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [contentUpdates, setContentUpdates] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [commentsLikes, setCommentsLikes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleToggle = (setting: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    sendUserAction({ action: 'notification_toggle', screen: 'notifications', value: `${setting}:${value}` });
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
          Notifications
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Push Notifications */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Push Notifications
        </Text>
        <ToggleItem
          label="Content Updates"
          description="New content matching your interests"
          value={contentUpdates}
          onToggle={(v) => handleToggle('content_updates', v, setContentUpdates)}
        />
        <ToggleItem
          label="New Followers"
          description="When someone follows you"
          value={newFollowers}
          onToggle={(v) => handleToggle('new_followers', v, setNewFollowers)}
        />
        <ToggleItem
          label="Comments & Likes"
          description="Activity on your content"
          value={commentsLikes}
          onToggle={(v) => handleToggle('comments_likes', v, setCommentsLikes)}
        />

        {/* Email Notifications */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 28, marginBottom: 8 }}>
          Email Notifications
        </Text>
        <ToggleItem
          label="Weekly Digest"
          description="Summary of your weekly activity"
          value={weeklyDigest}
          onToggle={(v) => handleToggle('weekly_digest', v, setWeeklyDigest)}
        />
        <ToggleItem
          label="Product Updates"
          description="New features and improvements"
          value={productUpdates}
          onToggle={(v) => handleToggle('product_updates', v, setProductUpdates)}
        />

        {/* Marketing */}
        <Text style={{ color: '#e4e4e9', fontSize: 16, fontWeight: '600', marginTop: 28, marginBottom: 8 }}>
          Marketing
        </Text>
        <ToggleItem
          label="Promotional Offers"
          description="Special offers and promotions"
          value={promotions}
          onToggle={(v) => handleToggle('promotions', v, setPromotions)}
        />
      </ScrollView>
    </View>
  );
}
