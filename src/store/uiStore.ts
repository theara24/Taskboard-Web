import { create } from 'zustand';
import { IssueFilters, ToastMessage } from '../types';

interface UIState {
  searchQuery: string;
  filters: IssueFilters;
  isCreateIssueModalOpen: boolean;
  isCreateProjectModalOpen: boolean;
  selectedIssueId: string | null;
  toasts: ToastMessage[];

  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: <K extends keyof IssueFilters>(key: K, value: IssueFilters[K]) => void;
  resetFilters: () => void;
  openCreateIssueModal: () => void;
  closeCreateIssueModal: () => void;
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
  setSelectedIssueId: (id: string | null) => void;
  showToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_FILTERS: IssueFilters = {
  status: 'ALL',
  priority: 'ALL',
  type: 'ALL',
  assigneeId: 'ALL',
  labelId: 'ALL',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  filters: DEFAULT_FILTERS,
  isCreateIssueModalOpen: false,
  isCreateProjectModalOpen: false,
  selectedIssueId: null,
  toasts: [],

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, searchQuery: '' }),

  openCreateIssueModal: () => set({ isCreateIssueModalOpen: true }),
  closeCreateIssueModal: () => set({ isCreateIssueModalOpen: false }),

  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),

  setSelectedIssueId: (id: string | null) => set({ selectedIssueId: id }),

  showToast: (type, message) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
