import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import { Avatar, Button } from '@/components/ui';
import { TextInput as RNTextInput } from 'react-native';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    user?.avatar_url || null
  );
  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      try {
        // Upload to Supabase Storage
        const ext = asset.uri.split('.').pop() || 'jpg';
        const fileName = `${firebaseUid}/avatar.${ext}`;

        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            upsert: true,
            contentType: `image/${ext}`,
          });

        if (uploadError) {
          // If storage bucket doesn't exist, just use local URI
          console.warn('Avatar upload failed:', uploadError.message);
          setAvatarUri(asset.uri);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName);

        setAvatarUri(publicUrl);
      } catch {
        // Use local URI as fallback
        setAvatarUri(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!firebaseUid || !username.trim()) return;

    setSaving(true);
    try {
      const updates: Record<string, string> = {
        username: username.trim(),
        bio: bio.trim(),
      };
      if (avatarUri && avatarUri !== user?.avatar_url) {
        updates.avatar_url = avatarUri;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', firebaseUid);

      if (error) throw error;

      // Update local store
      if (user) {
        setUser({
          ...user,
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: avatarUri,
        });
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#e4e4e9" />
        </TouchableOpacity>
        <Text className="text-h3 text-text-primary" accessibilityRole="header">
          Edit Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <View className="items-center py-6">
        <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8}>
          <Avatar
            uri={avatarUri}
            name={username || 'User'}
            size="xl"
          />
          <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent items-center justify-center border-2 border-bg-base">
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text className="text-caption text-accent mt-2">Change photo</Text>
      </View>

      {/* Fields */}
      <View className="px-4 gap-5">
        <View>
          <Text className="text-caption text-text-secondary mb-1.5">
            Username
          </Text>
          <RNTextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#555568"
            maxLength={30}
            autoCapitalize="none"
            className="bg-bg-surface border border-border text-text-primary rounded-card px-4 py-3 text-body"
          />
        </View>

        <View>
          <Text className="text-caption text-text-secondary mb-1.5">Bio</Text>
          <RNTextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#555568"
            maxLength={150}
            multiline
            numberOfLines={3}
            className="bg-bg-surface border border-border text-text-primary rounded-card px-4 py-3 text-body min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
          />
          <Text className="text-micro text-text-tertiary mt-1 text-right">
            {bio.length}/150
          </Text>
        </View>

        <View className="mt-4">
          <Button
            label={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="md"
            fullWidth
            disabled={saving || !username.trim()}
          />
        </View>
      </View>
    </ScrollView>
  );
}
