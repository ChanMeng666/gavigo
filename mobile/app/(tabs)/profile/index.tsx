import { View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/services/firebase';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { Button } from '@/components/ui';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <ProfileHeader user={user} />

      <View className="px-4">
        <SettingsSection title="Account">
          <SettingsItem icon="notifications-outline" label="Notifications" />
          <SettingsItem icon="shield-outline" label="Privacy & Security" />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsItem
            icon="moon-outline"
            label="Appearance"
            value="On"
          />
          <SettingsItem icon="language-outline" label="Language" />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsItem
            icon="information-circle-outline"
            label="About GAVIGO"
          />
          <SettingsItem icon="help-circle-outline" label="Help & Support" />
          <SettingsItem icon="document-text-outline" label="Terms of Service" />
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
