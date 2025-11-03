import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types/global';
import { STORAGE_KEYS } from '@/utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role;
  login: (user: User, token: string) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: 'guest',
      
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          role: user.role,
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: 'guest',
        });
      },
      
      setRole: (role) => {
        set({ role });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
    }
  )
);
