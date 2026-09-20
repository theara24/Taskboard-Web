import { apiClient } from './client';
import { Comment } from '../types';

export const commentApi = {
  create: async (issueId: string, content: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/issues/${issueId}/comments`, { content });
  },

  update: async (commentId: string, content: string): Promise<Comment> => {
    return apiClient.patch<Comment>(`/comments/${commentId}`, { content });
  },

  delete: async (commentId: string): Promise<void> => {
    return apiClient.delete<void>(`/comments/${commentId}`);
  },
};
