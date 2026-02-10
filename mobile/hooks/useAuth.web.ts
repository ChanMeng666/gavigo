// Web-specific auth hook - auto-authenticates as demo user
// Metro bundler automatically picks .web.ts over .ts for web builds
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

function initDemoUser() {
  const store = useAuthStore.getState();
  if (!store.isAuthenticated) {
    store.setFirebaseAuth('demo-web-user', 'demo-token-web');
    store.setUser({
      id: 'demo',
      firebase_uid: 'demo-web-user',
      username: 'demo_viewer',
      avatar_url: null,
      bio: 'Demo user for web preview',
      followers_count: 0,
      following_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString(),
    });
    store.setLoading(false);
  }
}

// Initialize immediately on module load (before first render)
initDemoUser();

export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initDemoUser();
  }, []);

  return { isAuthenticated, isLoading };
}
