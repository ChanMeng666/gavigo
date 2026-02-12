import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}) {
  return (
    <View className="items-center">
      <Ionicons name={name} size={size} color={color} />
      {focused && (
        <View className="w-1 h-1 rounded-full bg-accent mt-0.5" />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const tabBarHeight = Platform.OS === 'ios' ? 64 : 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#555568',
        tabBarStyle: {
          backgroundColor: '#0e0e18',
          borderTopColor: '#1e1e30',
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 12 : 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'compass' : 'compass-outline'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'sparkles' : 'sparkles-outline'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
