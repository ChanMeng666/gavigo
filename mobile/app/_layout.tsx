import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSegments } from 'expo-router';
import '../global.css';

// Only import BottomSheetModalProvider on native — it crashes on web
let BottomSheetModalProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;
if (Platform.OS !== 'web') {
  BottomSheetModalProvider = require('@gorhom/bottom-sheet').BottomSheetModalProvider;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/feed');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0e0e18', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#f0f0f5', fontSize: 28, fontWeight: 'bold' }}>GAVIGO</Text>
        <Text style={{ color: '#8e8ea0', fontSize: 13, marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const content = (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthGuard>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {BottomSheetModalProvider ? (
        <BottomSheetModalProvider>{content}</BottomSheetModalProvider>
      ) : (
        content
      )}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
