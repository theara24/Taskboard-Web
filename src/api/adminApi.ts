import { apiClient } from './client';
import { AdminDashboardMetrics, User, Project, Role } from '../types';

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface AdminProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export const adminApi = {
  getDashboardMetrics: async (): Promise<AdminDashboardMetrics> => {
    return apiClient.get<AdminDashboardMetrics>('/admin/dashboard');
  },

  getUsers: async (params?: AdminUsersParams): Promise<{ users: any[]; pagination: any }> => {
    const raw = await apiClient.get<any>('/admin/users', { params });
    if (raw && Array.isArray(raw.users)) {
      return raw;
    }
    return { users: Array.isArray(raw) ? raw : [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  },

  getUserDetail: async (userId: string): Promise<any> => {
    return apiClient.get<any>(`/admin/users/${userId}`);
  },

  updateUserRole: async (userId: string, role: Role): Promise<User> => {
    return apiClient.patch<User>(`/admin/users/${userId}/role`, { role });
  },

  getProjects: async (params?: AdminProjectsParams): Promise<{ projects: any[]; pagination: any }> => {
    const raw = await apiClient.get<any>('/admin/projects', { params });
    if (raw && Array.isArray(raw.projects)) {
      return raw;
    }
    return { projects: Array.isArray(raw) ? raw : [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  },

  getProjectDetail: async (projectId: string): Promise<any> => {
    return apiClient.get<any>(`/admin/projects/${projectId}`);
  },

  deleteProject: async (projectId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/projects/${projectId}`);
  },
};
