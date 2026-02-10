import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { resetPassword } from '@/services/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      Alert.alert(
        'Email Sent',
        'Check your inbox for a password reset link',
        [{ text: 'OK', onPress: () => router.back() }]
      );
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
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-8">
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-white tracking-tight">
            Reset Password
          </Text>
          <Text className="text-sm text-gray-400 mt-2 text-center">
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className="bg-accent-primary rounded-xl py-4 items-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link back */}
        <View className="mt-6 items-center">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-accent-secondary text-sm">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
