// Web-specific auth - Supabase Auth replacing Firebase mock
// Metro bundler automatically picks .web.ts over .ts for web builds
import { useAuthStore } from '@/stores/authStore';
import { supabase } from './supabase';

export async function signInWithEmail(email: string, password: string) {
  console.log('[AUTH] signInWithEmail called', { email });
  console.log('[AUTH] Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('[AUTH] signIn response:', { user: data?.user?.id, session: !!data?.session, error });

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
  console.log('[AUTH] signUpWithEmail called', { email, username });
  console.log('[AUTH] Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: undefined,
    },
  });

  console.log('[AUTH] signUp response:', { user: data?.user?.id, session: !!data?.session, error });

  if (error) throw new Error(error.message);

  const user = data.user;
  const session = data.session;

  // If email confirmation is required, session will be null
  if (user && !session) {
    console.log('[AUTH] Email confirmation may be required. Attempting sign-in directly...');
    // Try signing in immediately (works if email confirmation is disabled or auto-confirmed)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('[AUTH] Auto sign-in result:', { user: signInData?.user?.id, session: !!signInData?.session, error: signInError });

    if (signInData?.session) {
      useAuthStore.getState().setFirebaseAuth(signInData.user!.id, signInData.session.access_token);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user!.id)
        .single();

      console.log('[AUTH] Profile fetched:', profile);

      if (profile) {
        useAuthStore.getState().setUser({
          id: profile.id,
          firebase_uid: signInData.user!.id,
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
        user: { uid: signInData.user!.id, displayName: username, email: signInData.user!.email },
      };
    }

    // If sign-in also fails, email confirmation is truly required
    throw new Error('Please check your email to confirm your account, then sign in.');
  }

  if (user && session) {
    console.log('[AUTH] Got session immediately, setting auth state');
    useAuthStore.getState().setFirebaseAuth(user.id, session.access_token);

    // Profile auto-created via DB trigger; fetch it
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('[AUTH] Profile fetched:', profile);

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
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/mobile/reset-password`
    : 'https://ire.gavigo.com/mobile/reset-password';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}

// Module-level flag: when PASSWORD_RECOVERY fires, suppress the SIGNED_IN
// event that Supabase immediately emits afterwards so the user stays on the
// reset-password screen instead of being auto-logged into the app.
let _inPasswordRecovery = false;

export function onAuthStateChanged(callback: (user: any) => void) {
  // Check initial session — but skip if we're in password recovery mode
  // (the URL contains a recovery token that Supabase already picked up).
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (_inPasswordRecovery) return;

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
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      _inPasswordRecovery = true;
      // Signal password recovery mode — pass a special marker so the
      // auth hook can navigate to the reset-password screen.
      callback({
        uid: session?.user?.id ?? 'recovery',
        displayName: null,
        email: session?.user?.email ?? null,
        photoURL: null,
        getIdToken: async () => session?.access_token ?? '',
        _passwordRecovery: true,
      });
      return;
    }

    // Suppress the SIGNED_IN event that fires right after PASSWORD_RECOVERY
    if (_inPasswordRecovery && event === 'SIGNED_IN') {
      return;
    }

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
      // User signed out — clear recovery flag
      _inPasswordRecovery = false;
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}

/** Call this after the user successfully updates their password to
 *  re-enable normal auth flow before signing them out. */
export function clearPasswordRecovery() {
  _inPasswordRecovery = false;
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
