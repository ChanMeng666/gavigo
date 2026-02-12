import { View, Text } from 'react-native';
import { Avatar, Button, Divider } from '@/components/ui';
import type { UserProfile } from '@/types';

interface ProfileHeaderProps {
  user: UserProfile | null;
  onEditProfile?: () => void;
}

export function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
  return (
    <View className="items-center px-4 pt-4 pb-6">
      {/* Subtle gradient bg behind avatar */}
      <View
        className="absolute top-0 left-0 right-0 h-32"
        style={{ backgroundColor: 'rgba(124,58,237,0.05)' }}
      />

      {/* Avatar */}
      <Avatar
        uri={user?.avatar_url}
        name={user?.username || 'User'}
        size="xl"
      />

      {/* Username */}
      <Text className="text-h2 text-text-primary mt-3">
        {user?.username || 'User'}
      </Text>

      {/* Bio */}
      {user?.bio ? (
        <Text className="text-body text-text-secondary mt-1 text-center px-8">
          {user.bio}
        </Text>
      ) : (
        <Text className="text-body italic text-text-tertiary mt-1">
          Tap to add a bio
        </Text>
      )}

      {/* Stats row */}
      <View className="flex-row items-center mt-6 gap-0">
        <View className="flex-1 items-center">
          <Text className="text-h3 font-bold text-text-primary">
            {user?.followers_count ?? 0}
          </Text>
          <Text className="text-micro text-text-secondary">Followers</Text>
        </View>
        <View className="w-px h-8 bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-h3 font-bold text-text-primary">
            {user?.following_count ?? 0}
          </Text>
          <Text className="text-micro text-text-secondary">Following</Text>
        </View>
        <View className="w-px h-8 bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-h3 font-bold text-text-primary">
            {user?.likes_count ?? 0}
          </Text>
          <Text className="text-micro text-text-secondary">Likes</Text>
        </View>
      </View>

      {/* Edit Profile */}
      <View className="mt-6 w-full">
        <Button
          label="Edit Profile"
          onPress={onEditProfile || (() => {})}
          variant="secondary"
          size="md"
          fullWidth
        />
      </View>
    </View>
  );
}
