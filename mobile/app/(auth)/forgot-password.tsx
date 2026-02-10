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
import { resetPassword } from '@/services/firebase';
import { Button, TextInput, IconButton } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
      setTimeout(() => router.back(), 3000);
    } catch (error: any) {
      const message =
        error?.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : 'Failed to send reset email. Please try again';
      Alert.alert('Error', message);
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
        {/* Back button */}
        <View
          className="absolute left-2"
          style={{ top: insets.top + 4 }}
        >
          <IconButton
            icon="chevron-back"
            variant="ghost"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          />
        </View>

        <View className="px-8">
          {sent ? (
            /* Success state */
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-success/15 items-center justify-center mb-4">
                <Ionicons name="checkmark" size={32} color="#34d399" />
              </View>
              <Text className="text-h2 text-text-primary mb-2">
                Email Sent!
              </Text>
              <Text className="text-body text-text-secondary text-center">
                Check your inbox for a reset link
              </Text>
            </View>
          ) : (
            /* Form state */
            <>
              {/* Header */}
              <View className="items-center mb-10">
                <View className="w-16 h-16 rounded-full bg-accent-subtle items-center justify-center mb-4">
                  <Ionicons name="lock-closed" size={28} color="#7c3aed" />
                </View>
                <Text
                  className="text-h1 text-text-primary"
                  accessibilityRole="header"
                >
                  Reset Password
                </Text>
                <Text className="text-body text-text-secondary mt-2 text-center">
                  Enter your email and we'll send you a reset link
                </Text>
              </View>

              {/* Form */}
              <View className="gap-4">
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon="mail-outline"
                  autoFocus
                />

                <Button
                  label="Send Reset Link"
                  onPress={handleReset}
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
