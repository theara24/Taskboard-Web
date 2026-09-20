import { create } from 'zustand';
import { AdminDashboardMetrics, User, Role } from '../types';
import { adminApi, AdminUsersParams, AdminProjectsParams } from '../api';

interface AdminState {
  metrics: AdminDashboardMetrics | null;
  users: any[];
  usersPagination: any;
  projects: any[];
  projectsPagination: any;
  selectedUserDetail: any | null;
  selectedProjectDetail: any | null;
  isLoading: boolean;
  error: string | null;

  fetchMetrics: (silent?: boolean) => Promise<void>;
  fetchUsers: (params?: AdminUsersParams, silent?: boolean) => Promise<void>;
  fetchUserDetail: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<User | null>;
  fetchProjects: (params?: AdminProjectsParams, silent?: boolean) => Promise<void>;
  fetchProjectDetail: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  metrics: null,
  users: [],
  usersPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  projects: [],
  projectsPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  selectedUserDetail: null,
  selectedProjectDetail: null,
  isLoading: false,
  error: null,

  fetchMetrics: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const metrics = await adminApi.getDashboardMetrics();
      set({ metrics, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to fetch admin metrics', isLoading: false });
    }
  },

  fetchUsers: async (params, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await adminApi.getUsers(params);
      set({ users: res.users, usersPagination: res.pagination, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to fetch users', isLoading: false });
    }
  },

  fetchUserDetail: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await adminApi.getUserDetail(userId);
      set({ selectedUserDetail: detail, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch user details', isLoading: false });
    }
  },

  updateUserRole: async (userId: string, role: Role) => {
    try {
      const updatedUser = await adminApi.updateUserRole(userId, role);
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? { ...u, role: updatedUser.role } : u)),
        selectedUserDetail:
          state.selectedUserDetail?.id === userId
            ? { ...state.selectedUserDetail, role: updatedUser.role }
            : state.selectedUserDetail,
      }));
      return updatedUser;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update user role' });
      return null;
    }
  },

  fetchProjects: async (params, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await adminApi.getProjects(params);
      set({ projects: res.projects, projectsPagination: res.pagination, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to fetch admin projects', isLoading: false });
    }
  },

  fetchProjectDetail: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await adminApi.getProjectDetail(projectId);
      set({ selectedProjectDetail: detail, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project details', isLoading: false });
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await adminApi.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        selectedProjectDetail:
          state.selectedProjectDetail?.id === projectId ? null : state.selectedProjectDetail,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete project' });
      return false;
    }
  },
}));
