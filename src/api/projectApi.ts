import { apiClient } from './client';
import { Project, ProjectMemberRole, Label } from '../types';

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  getById: async (id: string): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    return apiClient.post<Project>('/projects', data);
  },

  update: async (id: string, data: UpdateProjectInput): Promise<Project> => {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}`);
  },

  addMember: async (
    projectId: string,
    userId: string,
    role: ProjectMemberRole = 'MEMBER',
  ): Promise<void> => {
    return apiClient.post<void>(`/projects/${projectId}/members`, { userId, role });
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${projectId}/members/${userId}`);
  },

  getLabels: async (projectId: string): Promise<Label[]> => {
    return apiClient.get<Label[]>(`/projects/${projectId}/labels`);
  },

  createLabel: async (projectId: string, name: string): Promise<Label> => {
    return apiClient.post<Label>(`/projects/${projectId}/labels`, { name });
  },
};
