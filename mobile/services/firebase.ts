import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { api } from './api';

export async function signInWithEmail(email: string, password: string) {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  await syncAuthState(credential.user);
  return credential;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
) {
  const credential = await auth().createUserWithEmailAndPassword(
    email,
    password
  );

  // Update display name
  await credential.user.updateProfile({ displayName: username });

  await syncAuthState(credential.user);

  // Create profile on backend
  try {
    await api.updateProfile({
      username,
      firebase_uid: credential.user.uid,
    });
  } catch {
    // Profile creation will happen on first /me call if this fails
  }

  return credential;
}

export async function signOut() {
  await auth().signOut();
  useAuthStore.getState().logout();
}

export async function resetPassword(email: string) {
  await auth().sendPasswordResetEmail(email);
}

async function syncAuthState(user: FirebaseAuthTypes.User) {
  const token = await user.getIdToken();
  useAuthStore.getState().setFirebaseAuth(user.uid, token);

  // Fetch user profile from backend
  try {
    const profile = await api.getProfile();
    useAuthStore.getState().setUser(profile);
  } catch {
    // User may not have a profile yet - set basic info from Firebase
    useAuthStore.getState().setUser({
      id: '',
      firebase_uid: user.uid,
      username: user.displayName || user.email?.split('@')[0] || 'user',
      avatar_url: user.photoURL,
      bio: '',
      followers_count: 0,
      following_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString(),
    });
  }
}

export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
) {
  return auth().onAuthStateChanged(callback);
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}
