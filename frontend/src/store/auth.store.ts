import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Cookie cleanup is best-effort; local state should still be cleared.
        }
        set({ user: null });
      },
    }),
    { name: 'auth-user' },
  ),
);

if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearUser();
  });
}
