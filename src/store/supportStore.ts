import { create } from 'zustand';
import { SupportTicket, SupportTicketMessage, SupportStatus, SupportPriority } from '../types';
import { supportApi, CreateSupportTicketPayload, SupportTicketListParams } from '../api';

interface SupportState {
  userTickets: SupportTicket[];
  userPagination: any;
  adminTickets: SupportTicket[];
  adminPagination: any;
  currentTicketDetail: SupportTicket | null;
  isLoading: boolean;
  error: string | null;

  fetchUserTickets: (params?: SupportTicketListParams, silent?: boolean) => Promise<void>;
  fetchAdminTickets: (params?: SupportTicketListParams, silent?: boolean) => Promise<void>;
  fetchTicketDetail: (ticketId: string, silent?: boolean) => Promise<void>;
  createTicket: (payload: CreateSupportTicketPayload) => Promise<SupportTicket | null>;
  addMessage: (ticketId: string, messageText: string) => Promise<SupportTicketMessage | null>;
  updateStatus: (ticketId: string, status: SupportStatus) => Promise<boolean>;
  updatePriority: (ticketId: string, priority: SupportPriority) => Promise<boolean>;
  clearCurrentTicket: () => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  userTickets: [],
  userPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  adminTickets: [],
  adminPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  currentTicketDetail: null,
  isLoading: false,
  error: null,

  fetchUserTickets: async (params, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await supportApi.getUserTickets(params);
      set({ userTickets: res.tickets, userPagination: res.pagination, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to fetch support tickets', isLoading: false });
    }
  },

  fetchAdminTickets: async (params, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await supportApi.getAdminTickets(params);
      set({ adminTickets: res.tickets, adminPagination: res.pagination, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to fetch admin support tickets', isLoading: false });
    }
  },

  fetchTicketDetail: async (ticketId: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const detail = await supportApi.getTicketDetail(ticketId);
      set({ currentTicketDetail: detail, isLoading: false });
    } catch (err: any) {
      if (!silent) set({ error: err.message || 'Failed to load ticket details', isLoading: false });
    }
  },

  createTicket: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newTicket = await supportApi.createTicket(payload);
      set((state) => ({
        userTickets: [newTicket, ...state.userTickets],
        isLoading: false,
      }));
      return newTicket;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create support ticket', isLoading: false });
      return null;
    }
  },

  addMessage: async (ticketId, messageText) => {
    try {
      const msg = await supportApi.addMessage(ticketId, messageText);
      const current = get().currentTicketDetail;
      if (current && current.id === ticketId) {
        set({
          currentTicketDetail: {
            ...current,
            messages: [...(current.messages || []), msg],
            updatedAt: new Date().toISOString(),
          },
        });
      }
      return msg;
    } catch (err: any) {
      set({ error: err.message || 'Failed to send message' });
      return null;
    }
  },

  updateStatus: async (ticketId, status) => {
    try {
      const updated = await supportApi.updateStatus(ticketId, status);
      const current = get().currentTicketDetail;
      if (current && current.id === ticketId) {
        set({
          currentTicketDetail: {
            ...current,
            status: updated.status,
            updatedAt: updated.updatedAt,
            resolvedAt: updated.resolvedAt,
          },
        });
      }
      set((state) => ({
        adminTickets: state.adminTickets.map((t) => (t.id === ticketId ? { ...t, status: updated.status } : t)),
        userTickets: state.userTickets.map((t) => (t.id === ticketId ? { ...t, status: updated.status } : t)),
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update ticket status' });
      return false;
    }
  },

  updatePriority: async (ticketId, priority) => {
    try {
      const updated = await supportApi.updatePriority(ticketId, priority);
      const current = get().currentTicketDetail;
      if (current && current.id === ticketId) {
        set({
          currentTicketDetail: {
            ...current,
            priority: updated.priority,
            updatedAt: updated.updatedAt,
          },
        });
      }
      set((state) => ({
        adminTickets: state.adminTickets.map((t) => (t.id === ticketId ? { ...t, priority: updated.priority } : t)),
        userTickets: state.userTickets.map((t) => (t.id === ticketId ? { ...t, priority: updated.priority } : t)),
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update ticket priority' });
      return false;
    }
  },

  clearCurrentTicket: () => set({ currentTicketDetail: null }),
}));
