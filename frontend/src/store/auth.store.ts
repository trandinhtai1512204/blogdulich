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
  logout: () => Promise<void>;  // ← thêm
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: async () => {
  try {
    await api.post('/auth/logout'); // axios instance đã có baseURL đúng
  } catch (_) {}
  set({ user: null });
},
    }),
    { name: 'auth-user' }
  )
);

