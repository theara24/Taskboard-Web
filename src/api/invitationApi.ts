import { apiClient } from './client';
import { ProjectInvitation, Project } from '../types';

export const invitationApi = {
  invite: async (
    projectId: string,
    identifier: string,
    role: string = 'MEMBER',
  ): Promise<ProjectInvitation> => {
    return apiClient.post<ProjectInvitation>(`/projects/${projectId}/invitations`, {
      identifier,
      role,
    });
  },

  listByProject: async (projectId: string): Promise<ProjectInvitation[]> => {
    return apiClient.get<ProjectInvitation[]>(`/projects/${projectId}/invitations`);
  },

  revoke: async (projectId: string, invitationId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(
      `/projects/${projectId}/invitations/${invitationId}`,
    );
  },

  accept: async (
    invitationId: string,
  ): Promise<{ success: boolean; project: Project; invitation: ProjectInvitation }> => {
    return apiClient.post<{ success: boolean; project: Project; invitation: ProjectInvitation }>(
      `/invitations/${invitationId}/accept`,
    );
  },

  decline: async (invitationId: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/invitations/${invitationId}/decline`);
  },
};
