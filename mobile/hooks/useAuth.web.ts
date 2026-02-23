// Web-specific auth hook - real Supabase session listener
// Metro bundler automatically picks .web.ts over .ts for web builds
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthStateChanged } from '@/services/firebase';
import { supabase } from '@/services/supabase';
import { router } from 'expo-router';

export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const recoveryHandled = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user?._passwordRecovery && !recoveryHandled.current) {
        // PASSWORD_RECOVERY event — navigate to reset screen instead of
        // logging the user into the main app.
        recoveryHandled.current = true;
        useAuthStore.getState().setLoading(false);
        router.replace('/(auth)/reset-password');
        return;
      }

      if (user && !user._passwordRecovery) {
        useAuthStore.getState().setFirebaseAuth(user.uid, await user.getIdToken());

        // Fetch profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .single();

        if (profile) {
          useAuthStore.getState().setUser({
            id: profile.id,
            firebase_uid: user.uid,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio || '',
            followers_count: profile.followers_count,
            following_count: profile.following_count,
            likes_count: profile.likes_count,
            created_at: profile.created_at,
          });
        }
      } else if (!user) {
        useAuthStore.getState().logout();
      }
      useAuthStore.getState().setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { isAuthenticated, isLoading };
}
