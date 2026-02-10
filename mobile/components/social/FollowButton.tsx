import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { Button, Chip } from '@/components/ui';

interface FollowButtonProps {
  userId: string;
  compact?: boolean;
}

export function FollowButton({ userId, compact = false }: FollowButtonProps) {
  const isFollowing = useSocialStore((s) => s.following[userId] ?? false);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handlePress = async () => {
    toggleFollow(userId);

    if (isAuthenticated) {
      try {
        if (!isFollowing) {
          await api.followUser(userId);
        } else {
          await api.unfollowUser(userId);
        }
      } catch {
        toggleFollow(userId);
      }
    }
  };

  if (compact) {
    return (
      <Chip
        label={isFollowing ? 'Following' : 'Follow'}
        selected={!isFollowing}
        onPress={handlePress}
        leftIcon={isFollowing ? 'checkmark-outline' : 'add-outline'}
        compact
      />
    );
  }

  return (
    <Button
      label={isFollowing ? 'Following' : 'Follow'}
      onPress={handlePress}
      variant={isFollowing ? 'secondary' : 'primary'}
      size="md"
      fullWidth
    />
  );
}
