import { useSocialStore } from '@/stores/socialStore';
import { useAuthStore } from '@/stores/authStore';
import { toggleFollow as toggleFollowApi } from '@/services/social';
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
    // Optimistic update
    toggleFollow(userId);

    if (isAuthenticated) {
      try {
        await toggleFollowApi(userId);
      } catch {
        // Revert on error
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
