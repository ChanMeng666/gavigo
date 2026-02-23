import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { Button, TextInput } from '@/components/ui';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleUpdate = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Sign out so the user logs in fresh with the new password
      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-base"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8" style={{ paddingTop: insets.top }}>
          {done ? (
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-success/15 items-center justify-center mb-4">
                <Ionicons name="checkmark" size={32} color="#34d399" />
              </View>
              <Text className="text-h2 text-text-primary mb-2">
                Password Updated!
              </Text>
              <Text className="text-body text-text-secondary text-center">
                Redirecting to login...
              </Text>
            </View>
          ) : (
            <>
              <View className="items-center mb-10">
                <View className="w-16 h-16 rounded-full bg-accent-subtle items-center justify-center mb-4">
                  <Ionicons name="key" size={28} color="#7c3aed" />
                </View>
                <Text
                  className="text-h1 text-text-primary"
                  accessibilityRole="header"
                >
                  New Password
                </Text>
                <Text className="text-body text-text-secondary mt-2 text-center">
                  Enter your new password below
                </Text>
              </View>

              <View className="gap-4">
                <TextInput
                  label="New Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                  autoComplete="new-password"
                  leftIcon="lock-closed-outline"
                  autoFocus
                />

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  secureTextEntry
                  autoComplete="new-password"
                  leftIcon="lock-closed-outline"
                />

                <Button
                  label="Update Password"
                  onPress={handleUpdate}
                  loading={loading}
                  size="lg"
                  fullWidth
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
