import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signUpWithEmail } from '@/services/firebase';
import { Button, TextInput, IconButton } from '@/components/ui';
import { sendUserAction } from '@/services/wsEvents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength
  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { level: 0, color: 'transparent', width: '0%' };
    if (password.length < 6) return { level: 1, color: '#f87171', width: '33%' };
    const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (password.length >= 8 && (hasMixed || hasNumbers))
      return { level: 3, color: '#34d399', width: '100%' };
    return { level: 2, color: '#fbbf24', width: '66%' };
  }, [password]);

  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    console.log('[REGISTER] Button pressed', { username, email, password: password.length + ' chars', confirmPassword: confirmPassword.length + ' chars' });

    if (!username.trim() || !email.trim() || !password.trim()) {
      console.log('[REGISTER] Validation failed: empty fields');
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('[REGISTER] Validation failed: passwords do not match');
      showAlert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('[REGISTER] Validation failed: password too short');
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('[REGISTER] Calling signUpWithEmail...');
      const result = await signUpWithEmail(email.trim(), password, username.trim());
      console.log('[REGISTER] signUpWithEmail succeeded:', result);
      sendUserAction({ action: 'auth_register', screen: 'register', value: 'success' });
    } catch (error: any) {
      console.error('[REGISTER] signUpWithEmail failed:', error);
      sendUserAction({ action: 'auth_register', screen: 'register', value: 'failed' });
      const message = error?.message || 'Registration failed. Please try again';
      showAlert('Registration Failed', message);
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
          {/* Header */}
          <View className="items-center mb-10">
            <Text
              className="text-h1 text-text-primary"
              accessibilityRole="header"
            >
              Create Account
            </Text>
            <Text className="text-caption text-text-secondary mt-1">
              Join the Instant Reality Exchange
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
              autoComplete="username"
              leftIcon="person-outline"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
            />

            <View>
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters"
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              {/* Password strength bar */}
              {password.length > 0 && (
                <View className="h-1 rounded-full bg-border mt-2 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </View>
              )}
            </View>

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              autoComplete="new-password"
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirm(!showConfirm)}
              error={
                confirmPassword && confirmPassword !== password
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Link back */}
          <View className="mt-6 items-center">
            <View className="flex-row items-center gap-1">
              <Text className="text-text-secondary text-body">
                Already have an account?
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-accent font-semibold text-body">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
