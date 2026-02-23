import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { sendScreenView } from '@/services/wsEvents';

export default function AuthLayout() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const screen = segments[segments.length - 1] || 'login';
    sendScreenView(screen);
  }, [pathname]);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0e0e18' },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
