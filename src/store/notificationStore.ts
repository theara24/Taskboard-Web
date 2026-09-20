import { create } from 'zustand';
import { Notification } from '../types';
import { notificationApi, invitationApi } from '../api';
import { useProjectStore } from './projectStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  acceptInvitation: (invitationId: string, notificationId?: string) => Promise<boolean>;
  declineInvitation: (invitationId: string, notificationId?: string) => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const notifications = await notificationApi.getAll();
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      set({ unreadCount: res.count });
    } catch (err: any) {
      // Silently catch in background poll
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      await notificationApi.markRead(id);
    } catch (err: any) {
      // Revert if needed
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      await notificationApi.markAllRead();
    } catch (err: any) {
      get().fetchNotifications();
    }
  },

  acceptInvitation: async (invitationId: string, notificationId?: string) => {
    try {
      const res = await invitationApi.accept(invitationId);

      // Mark notification as read
      if (notificationId) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  isRead: true,
                  title: 'Invitation Accepted',
                  message: `You joined "${res.project.name}".`,
                }
              : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }

      // Refresh projects so newly joined project appears immediately
      await useProjectStore.getState().fetchProjects();
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to accept invitation' });
      return false;
    }
  },

  declineInvitation: async (invitationId: string, notificationId?: string) => {
    try {
      await invitationApi.decline(invitationId);

      if (notificationId) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  isRead: true,
                  title: 'Invitation Declined',
                  message: `You declined the project invitation.`,
                }
              : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to decline invitation' });
      return false;
    }
  },
}));
