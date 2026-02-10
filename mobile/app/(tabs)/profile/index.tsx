import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/services/firebase';

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
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="items-center px-4 pt-4 pb-6">
        {/* Avatar */}
        <View className="w-24 h-24 rounded-full bg-accent-primary items-center justify-center mb-4">
          <Text className="text-4xl text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>

        <Text className="text-white text-xl font-bold">
          {user?.username || 'User'}
        </Text>
        {user?.bio ? (
          <Text className="text-white/60 text-sm mt-1 text-center px-8">
            {user.bio}
          </Text>
        ) : (
          <Text className="text-white/40 text-sm mt-1">No bio yet</Text>
        )}

        {/* Stats */}
        <View className="flex-row gap-8 mt-6">
          <View className="items-center">
            <Text className="text-white font-bold text-lg">
              {user?.followers_count ?? 0}
            </Text>
            <Text className="text-white/50 text-xs">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-white font-bold text-lg">
              {user?.following_count ?? 0}
            </Text>
            <Text className="text-white/50 text-xs">Following</Text>
          </View>
          <View className="items-center">
            <Text className="text-white font-bold text-lg">
              {user?.likes_count ?? 0}
            </Text>
            <Text className="text-white/50 text-xs">Likes</Text>
          </View>
        </View>

        {/* Edit Profile button */}
        <TouchableOpacity
          className="mt-6 px-8 py-2.5 rounded-lg bg-surface border border-border"
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold text-sm">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Settings sections */}
      <View className="px-4 mt-2">
        <Text className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
          Settings
        </Text>

        <SettingsItem icon="notifications-outline" label="Notifications" />
        <SettingsItem icon="moon-outline" label="Dark Mode" value="On" />
        <SettingsItem icon="shield-outline" label="Privacy" />
        <SettingsItem icon="information-circle-outline" label="About" />
        <SettingsItem icon="help-circle-outline" label="Help & Support" />

        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center gap-3 py-4 border-t border-border mt-2"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </View>
          <Text className="text-red-400 font-medium text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}

function SettingsItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3.5 border-b border-border/50"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
          <Ionicons name={icon} size={20} color="rgba(255,255,255,0.6)" />
        </View>
        <Text className="text-white text-base">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value && <Text className="text-white/40 text-sm">{value}</Text>}
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255,255,255,0.3)"
        />
      </View>
    </TouchableOpacity>
  );
}
