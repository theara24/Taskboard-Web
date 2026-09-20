import { apiClient } from './client';
import { SupportTicket, SupportTicketMessage, SupportCategory, SupportPriority, SupportStatus } from '../types';

export interface CreateSupportTicketPayload {
  subject: string;
  description: string;
  category?: SupportCategory;
  priority?: SupportPriority;
}

export interface SupportTicketListParams {
  page?: number;
  limit?: number;
  status?: SupportStatus;
  priority?: SupportPriority;
  category?: SupportCategory;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export const supportApi = {
  createTicket: async (payload: CreateSupportTicketPayload): Promise<SupportTicket> => {
    return apiClient.post<SupportTicket>('/support/tickets', payload);
  },

  getUserTickets: async (params?: SupportTicketListParams): Promise<{ tickets: SupportTicket[]; pagination: any }> => {
    const raw = await apiClient.get<any>('/support/tickets', { params });
    if (raw && Array.isArray(raw.tickets)) {
      return raw;
    }
    return { tickets: Array.isArray(raw) ? raw : [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  },

  getAdminTickets: async (params?: SupportTicketListParams): Promise<{ tickets: SupportTicket[]; pagination: any }> => {
    const raw = await apiClient.get<any>('/admin/support/tickets', { params });
    if (raw && Array.isArray(raw.tickets)) {
      return raw;
    }
    return { tickets: Array.isArray(raw) ? raw : [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  },

  getTicketDetail: async (ticketId: string): Promise<SupportTicket> => {
    return apiClient.get<SupportTicket>(`/support/tickets/${ticketId}`);
  },

  addMessage: async (ticketId: string, message: string): Promise<SupportTicketMessage> => {
    return apiClient.post<SupportTicketMessage>(`/support/tickets/${ticketId}/messages`, { message });
  },

  updateStatus: async (ticketId: string, status: SupportStatus): Promise<SupportTicket> => {
    return apiClient.patch<SupportTicket>(`/admin/support/tickets/${ticketId}/status`, { status });
  },

  updatePriority: async (ticketId: string, priority: SupportPriority): Promise<SupportTicket> => {
    return apiClient.patch<SupportTicket>(`/admin/support/tickets/${ticketId}/priority`, { priority });
  },
};
