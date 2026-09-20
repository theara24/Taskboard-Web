import { apiClient } from './client';
import { User, Role } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: Role = 'USER',
  ): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', { name, email, password, role });
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  getGoogleAuthUrl: (): string => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return `${base}/auth/google`;
  },

  googleDemoLogin: async (
    email: string,
    name?: string,
    avatarUrl?: string,
  ): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/google/demo', { email, name, avatarUrl });
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string }): Promise<User> => {
    return apiClient.patch<User>('/auth/profile', data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
  },
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },
};
