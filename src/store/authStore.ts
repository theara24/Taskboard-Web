import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../mock/initial-data';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string) => boolean;
  register: (name: string, email: string, role?: Role) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: INITIAL_USERS[1], // Default to Alice Johnson
      users: INITIAL_USERS,

      login: (email: string) => {
        const found = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (found) {
          set({ currentUser: found });
          return true;
        }
        return false;
      },

      register: (name: string, email: string, role: Role = 'USER') => {
        const existing = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing) {
          return false;
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email: email.toLowerCase(),
          role,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser,
        }));
        return true;
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchUser: (userId: string) => {
        const user = get().users.find((u) => u.id === userId);
        if (user) {
          set({ currentUser: user });
        }
      },
    }),
    {
      name: 'taskboard_auth_v1',
    },
  ),
);
