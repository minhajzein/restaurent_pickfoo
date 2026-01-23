import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      setAuth: (user) => set({ user, isAuthenticated: !!user }),
      logout: async () => {
        try {
          await api.get('/auth/logout');
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },
      initialize: async () => {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            set({ user: response.data.user, isAuthenticated: true, isInitialized: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
