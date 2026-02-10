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
import { Link } from 'expo-router';
import { signUpWithEmail } from '@/services/firebase';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, username.trim());
    } catch (error: any) {
      const message =
        error?.code === 'auth/email-already-in-use'
          ? 'This email is already registered'
          : error?.code === 'auth/weak-password'
            ? 'Password is too weak'
            : 'Registration failed. Please try again';
      Alert.alert('Registration Failed', message);
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
            Create Account
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Join the Instant Reality Exchange
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoComplete="username"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

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

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              placeholderTextColor="#555"
              secureTextEntry
              autoComplete="new-password"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor="#555"
              secureTextEntry
              autoComplete="new-password"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-accent-primary rounded-xl py-4 items-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link back to login */}
        <View className="mt-6 items-center">
          <View className="flex-row items-center gap-1">
            <Text className="text-gray-500 text-sm">
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-accent-primary font-semibold text-sm">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
