import { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Platform, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/services/firebase';

import { supabase } from '@/services/supabase';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { LikedGrid } from '@/components/profile/LikedGrid';
import { ChatHistory } from '@/components/profile/ChatHistory';
import { Button } from '@/components/ui';

const TABS = ['Liked', 'Chats', 'Settings'] as const;
type Tab = (typeof TABS)[number];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const setUser = useAuthStore((s) => s.setUser);
  const [activeTab, setActiveTab] = useState<Tab>('Liked');

  // Refresh profile from Supabase on mount
  useEffect(() => {
    if (!firebaseUid) return;

    (async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', firebaseUid)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            firebase_uid: firebaseUid,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio || '',
            followers_count: profile.followers_count,
            following_count: profile.following_count,
            likes_count: profile.likes_count,
            created_at: profile.created_at,
          });
        }
      } catch {
        // Use cached
      }
    })();
  }, [firebaseUid, setUser]);

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]);
    }
  };

  const handleEditProfile = () => {
    router.push('./edit');
  };

  const handleFollowersPress = () => {
    router.push('./followers?type=followers' as any);
  };

  const handleFollowingPress = () => {
    router.push('./followers?type=following' as any);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <ProfileHeader
        user={user}
        onEditProfile={handleEditProfile}
        onFollowersPress={handleFollowersPress}
        onFollowingPress={handleFollowingPress}
      />

      {/* Tab Bar */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#1e1e30',
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? '#7c3aed' : 'transparent',
            }}
          >
            <Text
              style={{
                color: activeTab === tab ? '#7c3aed' : '#555568',
                fontSize: 14,
                fontWeight: activeTab === tab ? '600' : '400',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'Liked' && <LikedGrid userId={firebaseUid} />}

      {activeTab === 'Chats' && <ChatHistory userId={firebaseUid} />}

      {activeTab === 'Settings' && (
        <View className="px-4">
          <SettingsSection title="Account">
            <SettingsItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push('./notifications' as any)}
            />
            <SettingsItem
              icon="shield-outline"
              label="Privacy & Security"
              onPress={() => router.push('./privacy' as any)}
            />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsItem
              icon="moon-outline"
              label="Appearance"
              value="Dark"
              onPress={() => showAlert('Appearance', 'Dark mode is the only theme')}
            />
            <SettingsItem
              icon="language-outline"
              label="Language"
              value="English"
              onPress={() => showAlert('Language', 'English is the only language')}
            />
          </SettingsSection>

          <SettingsSection title="About">
            <SettingsItem
              icon="information-circle-outline"
              label="About GAVIGO"
              onPress={() => router.push('./about' as any)}
            />
            <SettingsItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => router.push('./help' as any)}
            />
            <SettingsItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => router.push('./terms' as any)}
            />
          </SettingsSection>

          <View className="mt-8 mb-8">
            <Button
              label="Sign Out"
              onPress={handleSignOut}
              variant="danger"
              size="md"
              fullWidth
              leftIcon="log-out-outline"
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
