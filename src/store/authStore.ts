import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
