import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, EmptyState } from '@/components/ui';
import { FollowButton } from '@/components/social/FollowButton';

interface UserRow {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string;
}

export default function FollowersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'followers' | 'following' }>();
  const firebaseUid = useAuthStore((s) => s.firebaseUid);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const title = type === 'following' ? 'Following' : 'Followers';

  useEffect(() => {
    if (!firebaseUid) return;

    (async () => {
      try {
        if (type === 'following') {
          const { data } = await supabase
            .from('follows')
            .select('following_id, profiles!follows_following_id_fkey(id, username, avatar_url, bio)')
            .eq('follower_id', firebaseUid);

          if (data) {
            setUsers(
              data.map((d: any) => ({
                id: d.profiles.id,
                username: d.profiles.username,
                avatar_url: d.profiles.avatar_url,
                bio: d.profiles.bio,
              }))
            );
          }
        } else {
          const { data } = await supabase
            .from('follows')
            .select('follower_id, profiles!follows_follower_id_fkey(id, username, avatar_url, bio)')
            .eq('following_id', firebaseUid);

          if (data) {
            setUsers(
              data.map((d: any) => ({
                id: d.profiles.id,
                username: d.profiles.username,
                avatar_url: d.profiles.avatar_url,
                bio: d.profiles.bio,
              }))
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [firebaseUid, type]);

  const renderItem = useCallback(
    ({ item }: { item: UserRow }) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#1e1e30',
        }}
      >
        <Avatar uri={item.avatar_url} name={item.username} size="md" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: '#e4e4e9', fontSize: 15, fontWeight: '600' }}>
            {item.username}
          </Text>
          {item.bio ? (
            <Text
              style={{ color: '#555568', fontSize: 12, marginTop: 2 }}
              numberOfLines={1}
            >
              {item.bio}
            </Text>
          ) : null}
        </View>
        <FollowButton userId={item.id} compact />
      </View>
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e18' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 12,
          paddingTop: insets.top + 8,
          borderBottomWidth: 1,
          borderBottomColor: '#1e1e30',
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#e4e4e9" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#e4e4e9',
            fontSize: 17,
            fontWeight: '600',
          }}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#7c3aed" />
        </View>
      ) : users.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={type === 'following' ? 'people-outline' : 'person-add-outline'}
            title={type === 'following' ? 'Not following anyone' : 'No followers yet'}
            subtitle={
              type === 'following'
                ? 'Follow creators to see them here'
                : 'Share your profile to get followers'
            }
          />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}
