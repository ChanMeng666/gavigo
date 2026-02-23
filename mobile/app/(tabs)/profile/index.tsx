import { useEffect } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/services/firebase';
import { sendUserAction } from '@/services/wsEvents';
import { supabase } from '@/services/supabase';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { Button } from '@/components/ui';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const setUser = useAuthStore((s) => s.setUser);

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
    router.push('/(tabs)/profile/edit');
  };

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <ProfileHeader user={user} onEditProfile={handleEditProfile} />

      <View className="px-4">
        <SettingsSection title="Account">
          <SettingsItem icon="notifications-outline" label="Notifications" onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'notifications' })} />
          <SettingsItem icon="shield-outline" label="Privacy & Security" onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'privacy' })} />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon="moon-outline"
            label="Appearance"
            value="On"
            onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'appearance' })}
          />
          <SettingsItem icon="language-outline" label="Language" onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'language' })} />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsItem
            icon="information-circle-outline"
            label="About GAVIGO"
            onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'about' })}
          />
          <SettingsItem icon="help-circle-outline" label="Help & Support" onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'help' })} />
          <SettingsItem icon="document-text-outline" label="Terms of Service" onPress={() => sendUserAction({ action: 'settings_view', screen: 'profile', value: 'terms' })} />
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
    </ScrollView>
  );
}
