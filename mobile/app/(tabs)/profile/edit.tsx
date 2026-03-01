import { useState, useEffect, useRef } from 'react';
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
import { sendUserAction } from '@/services/wsEvents';
import { Avatar, Button } from '@/components/ui';
import { TextInput as RNTextInput } from 'react-native';

type SaveStatus = 'idle' | 'success' | 'no-changes' | 'error';

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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Original values for change detection
  const originalUsername = useRef(user?.username || '');
  const originalBio = useRef(user?.bio || '');
  const originalAvatar = useRef(user?.avatar_url || null);

  const hasChanges =
    username.trim() !== originalUsername.current ||
    bio.trim() !== originalBio.current ||
    avatarUri !== originalAvatar.current;

  // Clear status timer on unmount
  useEffect(() => {
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

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
        // Sanitize extension (uri may have query params)
        const rawExt = asset.uri.split('.').pop() || 'jpg';
        const ext = rawExt.split(/[?#]/)[0].toLowerCase();
        const validExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
        const fileName = `${firebaseUid}/avatar.${validExt}`;

        // Read as ArrayBuffer for wider compatibility (web + native)
        const response = await fetch(asset.uri);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, arrayBuffer, {
            upsert: true,
            contentType: `image/${validExt === 'jpg' ? 'jpeg' : validExt}`,
          });

        if (uploadError) {
          console.warn('Avatar upload failed:', uploadError.message);
          setSaveStatus('error');
          if (statusTimer.current) clearTimeout(statusTimer.current);
          statusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
          // Still use local URI so user sees their pick
          setAvatarUri(asset.uri);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName);

        // Cache-bust to force image refresh
        setAvatarUri(`${publicUrl}?t=${Date.now()}`);
      } catch (err) {
        console.warn('Avatar pick error:', err);
        setSaveStatus('error');
        if (statusTimer.current) clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
        // Use local URI as fallback
        setAvatarUri(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!firebaseUid || !username.trim()) return;

    if (!hasChanges) {
      setSaveStatus('no-changes');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('idle');
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

      // Track which fields changed
      const changedFields: string[] = [];
      if (username.trim() !== (user?.username || '')) changedFields.push('username');
      if (bio.trim() !== (user?.bio || '')) changedFields.push('bio');
      if (avatarUri !== user?.avatar_url) changedFields.push('avatar');
      sendUserAction({ action: 'profile_edit', screen: 'profile', value: changedFields.join(',') || 'none' });

      // Update local store
      if (user) {
        setUser({
          ...user,
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: avatarUri,
        });
      }

      // Update original values to reflect saved state
      originalUsername.current = username.trim();
      originalBio.current = bio.trim();
      originalAvatar.current = avatarUri;

      setSaveStatus('success');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getButtonLabel = () => {
    if (saving) return 'Saving...';
    if (!hasChanges) return 'No Changes';
    return 'Save Changes';
  };

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
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
            onChangeText={(text) => {
              setUsername(text);
              if (saveStatus !== 'idle') setSaveStatus('idle');
            }}
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
            onChangeText={(text) => {
              setBio(text);
              if (saveStatus !== 'idle') setSaveStatus('idle');
            }}
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

        {/* Status Banner */}
        {saveStatus === 'success' && (
          <View
            style={{
              backgroundColor: 'rgba(34,197,94,0.15)',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={{ color: '#22c55e', fontSize: 14, marginLeft: 8 }}>
              Profile updated successfully
            </Text>
          </View>
        )}
        {saveStatus === 'no-changes' && (
          <View
            style={{
              backgroundColor: 'rgba(85,85,104,0.15)',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="information-circle" size={18} color="#555568" />
            <Text style={{ color: '#555568', fontSize: 14, marginLeft: 8 }}>
              No changes to save
            </Text>
          </View>
        )}
        {saveStatus === 'error' && (
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 14, marginLeft: 8 }}>
              Failed to save profile
            </Text>
          </View>
        )}

        <View className="mt-4">
          <Button
            label={getButtonLabel()}
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
