import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthStateChanged } from '@/services/firebase';
import { api } from '@/services/api';

export function useAuth() {
  const { setUser, setFirebaseAuth, setLoading, isAuthenticated, isLoading } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setFirebaseAuth(firebaseUser.uid, token);

        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch {
          setUser({
            id: '',
            firebase_uid: firebaseUser.uid,
            username:
              firebaseUser.displayName ||
              firebaseUser.email?.split('@')[0] ||
              'user',
            avatar_url: firebaseUser.photoURL,
            bio: '',
            followers_count: 0,
            following_count: 0,
            likes_count: 0,
            created_at: new Date().toISOString(),
          });
        }

        // Refresh token periodically
        const refreshInterval = setInterval(async () => {
          try {
            const newToken = await firebaseUser.getIdToken(true);
            setFirebaseAuth(firebaseUser.uid, newToken);
          } catch {
            // Token refresh failed, will retry
          }
        }, 30 * 60 * 1000); // Every 30 minutes

        setLoading(false);
        return () => clearInterval(refreshInterval);
      } else {
        setUser(null);
        setFirebaseAuth(null, null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setUser, setFirebaseAuth, setLoading]);

  return { isAuthenticated, isLoading };
}
