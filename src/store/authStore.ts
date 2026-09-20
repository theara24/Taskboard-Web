import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import { authApi } from '../api';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<boolean>;
  googleDemoLogin: (email: string, name?: string, avatarUrl?: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<boolean>;
  setSession: (token: string, user: User) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: typeof window !== 'undefined' ? localStorage.getItem('taskboard_token') : null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(email.trim(), password);
          localStorage.setItem('taskboard_token', res.token);
          set({
            currentUser: res.user,
            token: res.token,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({
            error: err.message || 'Invalid email or password',
            isLoading: false,
          });
          return false;
        }
      },

      register: async (name: string, email: string, password: string, role: Role = 'USER') => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(name.trim(), email.trim(), password, role);
          localStorage.setItem('taskboard_token', res.token);
          set({
            currentUser: res.user,
            token: res.token,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({
            error: err.message || 'Registration failed',
            isLoading: false,
          });
          return false;
        }
      },

      googleDemoLogin: async (email: string, name?: string, avatarUrl?: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.googleDemoLogin(email.trim(), name, avatarUrl);
          localStorage.setItem('taskboard_token', res.token);
          set({
            currentUser: res.user,
            token: res.token,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({
            error: err.message || 'Google sign-in failed',
            isLoading: false,
          });
          return false;
        }
      },

      updateProfile: async (data: { name?: string; avatarUrl?: string }) => {
        try {
          const updated = await authApi.updateProfile(data);
          set({ currentUser: updated });
          return true;
        } catch (err: any) {
          set({ error: err.message || 'Failed to update profile' });
          return false;
        }
      },

      setSession: (token: string, user: User) => {
        localStorage.setItem('taskboard_token', token);
        set({
          token,
          currentUser: user,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('taskboard_token');
        if (!token) {
          set({ currentUser: null, token: null });
          return;
        }

        try {
          const user = await authApi.getMe();
          set({ currentUser: user, token });
        } catch {
          localStorage.removeItem('taskboard_token');
          set({ currentUser: null, token: null });
        }
      },

      logout: () => {
        localStorage.removeItem('taskboard_token');
        set({ currentUser: null, token: null, error: null });
      },
    }),
    {
      name: 'taskboard_auth_session',
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
    },
  ),
);
