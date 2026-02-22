import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Link } from 'expo-router';
import { signInWithEmail } from '@/services/firebase';
import { Button, TextInput, Chip } from '@/components/ui';
import { sendUserAction } from '@/services/wsEvents';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animated background circles
  const circle1X = useSharedValue(0);
  const circle1Y = useSharedValue(0);
  const circle2X = useSharedValue(0);
  const circle2Y = useSharedValue(0);

  useEffect(() => {
    circle1X.value = withRepeat(
      withTiming(30, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    circle1Y.value = withRepeat(
      withTiming(-20, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    circle2X.value = withRepeat(
      withTiming(-25, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    circle2Y.value = withRepeat(
      withTiming(15, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [circle1X, circle1Y, circle2X, circle2Y]);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle1X.value },
      { translateY: circle1Y.value },
    ],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: circle2X.value },
      { translateY: circle2Y.value },
    ],
  }));

  const showAlert = (title: string, message: string) => {
    if (typeof window !== 'undefined') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    console.log('[LOGIN] Button pressed', { email, password: password.length + ' chars' });

    if (!email.trim() || !password.trim()) {
      console.log('[LOGIN] Validation failed: empty fields');
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('[LOGIN] Calling signInWithEmail...');
      const result = await signInWithEmail(email.trim(), password);
      console.log('[LOGIN] signInWithEmail succeeded:', result);
      sendUserAction({ action: 'auth_login', screen: 'login', value: 'success' });
    } catch (error: any) {
      console.error('[LOGIN] signInWithEmail failed:', error);
      sendUserAction({ action: 'auth_login', screen: 'login', value: 'failed' });
      const message = error?.message || 'Login failed. Please try again';
      showAlert('Login Failed', message);
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
        {/* Animated background circles */}
        <Animated.View
          style={[
            circle1Style,
            {
              position: 'absolute',
              top: '15%',
              left: '-10%',
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: 'rgba(124,58,237,0.05)',
            },
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            circle2Style,
            {
              position: 'absolute',
              top: '40%',
              right: '-15%',
              width: 250,
              height: 250,
              borderRadius: 125,
              backgroundColor: 'rgba(6,182,212,0.03)',
            },
          ]}
          pointerEvents="none"
        />

        <View className="px-8">
          {/* Brand area */}
          <View className="items-center mb-12">
            <Text
              className="text-display text-text-primary tracking-tight"
              accessibilityRole="header"
            >
              GAVIGO
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Chip label="IRE" compact />
            </View>
            <Text className="text-caption text-text-secondary mt-2">
              Instant Reality Exchange
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
            />

            <View>
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity className="self-end mt-1.5">
                  <Text className="text-caption text-accent-light">
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              fullWidth
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-text-tertiary text-caption mx-3">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social login */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Google"
                onPress={() => {}}
                variant="secondary"
                leftIcon="logo-google"
                disabled
                fullWidth
              />
            </View>
            <View className="flex-1">
              <Button
                label="Apple"
                onPress={() => {}}
                variant="secondary"
                leftIcon="logo-apple"
                disabled
                fullWidth
              />
            </View>
          </View>

          {/* Sign up link */}
          <View className="mt-6 items-center">
            <View className="flex-row items-center gap-1">
              <Text className="text-text-secondary text-body">
                Don't have an account?
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-accent font-semibold text-body">
                    Sign Up
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
