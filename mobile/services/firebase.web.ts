// Web-specific auth - no Firebase native SDK needed
// Metro bundler automatically picks .web.ts over .ts for web builds
import { useAuthStore } from '@/stores/authStore';
import { api } from './api';

export async function signInWithEmail(email: string, _password: string) {
  const demoUid = 'demo-' + Date.now().toString(36);
  useAuthStore.getState().setFirebaseAuth(demoUid, 'demo-token');
  try {
    const profile = await api.getProfile();
    useAuthStore.getState().setUser(profile);
  } catch {
    useAuthStore.getState().setUser({
      id: '',
      firebase_uid: demoUid,
      username: email.split('@')[0] || 'demo_user',
      avatar_url: null,
      bio: '',
      followers_count: 0,
      following_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString(),
    });
  }
  return { user: { uid: demoUid, displayName: email.split('@')[0], email } };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  _username: string
) {
  return signInWithEmail(email, password);
}

export async function signOut() {
  useAuthStore.getState().logout();
}

export async function resetPassword(_email: string) {
  // No-op on web demo
}

export function onAuthStateChanged(
  callback: (user: any) => void
) {
  // Auto-login as demo user immediately
  const demoUser = {
    uid: 'demo-web-user',
    displayName: 'Demo Viewer',
    email: 'demo@gavigo.io',
    photoURL: null,
    getIdToken: async () => 'demo-token-web',
  };

  setTimeout(() => callback(demoUser), 0);

  // Return unsubscribe function
  return () => {};
}

export function getCurrentUser() {
  return {
    uid: 'demo-web-user',
    displayName: 'Demo Viewer',
    email: 'demo@gavigo.io',
    photoURL: null,
    getIdToken: async () => 'demo-token-web',
  };
}
