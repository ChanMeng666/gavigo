import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  firebaseUid: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setFirebaseAuth: (uid: string | null, token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUid: null,
  idToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setFirebaseAuth: (uid, token) =>
    set({ firebaseUid: uid, idToken: token }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  logout: () =>
    set({
      user: null,
      firebaseUid: null,
      idToken: null,
      isAuthenticated: false,
    }),
}));
