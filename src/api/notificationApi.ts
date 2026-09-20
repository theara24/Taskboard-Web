import { apiClient } from './client';
import { Notification } from '../types';

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    return apiClient.get<Notification[]>('/notifications');
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  markRead: async (id: string): Promise<Notification> => {
    return apiClient.patch<Notification>(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>('/notifications/mark-all-read');
  },
};
