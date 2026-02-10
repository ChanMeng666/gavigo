import { TouchableOpacity, Text } from 'react-native';
import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

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
      <TouchableOpacity
        onPress={handlePress}
        className={`px-3 py-0.5 rounded-md ${
          isFollowing ? 'bg-white/10' : 'bg-white/20'
        }`}
        activeOpacity={0.7}
      >
        <Text className="text-white text-xs font-medium">
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`px-6 py-2 rounded-lg ${
        isFollowing ? 'bg-surface border border-border' : 'bg-accent-primary'
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-white font-semibold text-sm">
        {isFollowing ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
}
