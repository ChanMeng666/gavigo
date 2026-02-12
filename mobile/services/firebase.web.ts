// Web-specific auth - Supabase Auth replacing Firebase mock
// Metro bundler automatically picks .web.ts over .ts for web builds
import { useAuthStore } from '@/stores/authStore';
import { supabase } from './supabase';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  const user = data.user!;
  const session = data.session!;

  // Store Supabase user.id as firebaseUid and access_token as idToken
  // (field names kept for backward compatibility with orchestrator dev mode)
  useAuthStore.getState().setFirebaseAuth(user.id, session.access_token);

  // Fetch or auto-create profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    useAuthStore.getState().setUser({
      id: profile.id,
      firebase_uid: user.id,
      username: profile.username,
      avatar_url: profile.avatar_url,
      bio: profile.bio || '',
      followers_count: profile.followers_count,
      following_count: profile.following_count,
      likes_count: profile.likes_count,
      created_at: profile.created_at,
    });
  }

  return {
    user: {
      uid: user.id,
      displayName: user.user_metadata?.username || email.split('@')[0],
      email: user.email,
    },
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) throw new Error(error.message);

  const user = data.user;
  const session = data.session;

  if (user && session) {
    useAuthStore.getState().setFirebaseAuth(user.id, session.access_token);

    // Profile auto-created via DB trigger; fetch it
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      useAuthStore.getState().setUser({
        id: profile.id,
        firebase_uid: user.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio || '',
        followers_count: profile.followers_count,
        following_count: profile.following_count,
        likes_count: profile.likes_count,
        created_at: profile.created_at,
      });
    }
  }

  return {
    user: user
      ? { uid: user.id, displayName: username, email: user.email }
      : null,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
  useAuthStore.getState().logout();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}

export function onAuthStateChanged(callback: (user: any) => void) {
  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const user = session.user;
      callback({
        uid: user.id,
        displayName: user.user_metadata?.username || user.email?.split('@')[0],
        email: user.email,
        photoURL: null,
        getIdToken: async () => session.access_token,
      });
    } else {
      callback(null);
    }
  });

  // Listen for auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user = session.user;
      callback({
        uid: user.id,
        displayName:
          user.user_metadata?.username || user.email?.split('@')[0],
        email: user.email,
        photoURL: null,
        getIdToken: async () => session.access_token,
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}

export function getCurrentUser() {
  const session = useAuthStore.getState();
  if (!session.firebaseUid) return null;
  return {
    uid: session.firebaseUid,
    displayName: session.user?.username || null,
    email: null,
    photoURL: session.user?.avatar_url || null,
    getIdToken: async () => session.idToken || '',
  };
}
