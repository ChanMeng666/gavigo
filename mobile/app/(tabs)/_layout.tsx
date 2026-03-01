import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendScreenView } from '@/services/wsEvents';

export default function TabsLayout() {
  const tabBarHeight = Platform.OS === 'ios' ? 64 : 56;
  const pathname = usePathname();

  // Track screen views on tab change
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const screen = segments[0] || 'feed';
    sendScreenView(screen);
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#555568',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0e0e18',
          borderTopColor: '#1e1e30',
          height: Platform.OS === 'ios' ? 56 : 48,
          paddingBottom: Platform.OS === 'ios' ? 8 : 4,
          paddingTop: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/followers"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/about"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/terms"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/help"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/notifications"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile/privacy"
        options={{ href: null }}
      />
    </Tabs>
  );
}
