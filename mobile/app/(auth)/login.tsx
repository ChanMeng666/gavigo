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
import { signInWithEmail } from '@/services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (error: any) {
      const message =
        error?.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error?.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please try again later'
            : 'Login failed. Please try again';
      Alert.alert('Login Failed', message);
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
        {/* Logo */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white tracking-tight">
            GAVIGO
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            Instant Reality Exchange
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

          <View>
            <Text className="text-gray-400 text-sm mb-2 ml-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#555"
              secureTextEntry
              autoComplete="password"
              className="bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-accent-primary rounded-xl py-4 items-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Links */}
        <View className="mt-6 items-center gap-3">
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text className="text-accent-secondary text-sm">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </Link>

          <View className="flex-row items-center gap-1">
            <Text className="text-gray-500 text-sm">
              Don't have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-accent-primary font-semibold text-sm">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
