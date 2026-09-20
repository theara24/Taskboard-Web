import { create } from 'zustand';
import { Issue, Comment, Label, Activity, IssueStatus, IssuePriority, IssueType, User } from '../types';
import { issueApi, commentApi, projectApi, CreateIssuePayload, UpdateIssuePayload } from '../api';

interface CreateIssueParams {
  projectId: string;
  reporter?: User;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: User | null;
  dueDate?: string | null;
  labels?: Label[];
}

interface IssueState {
  issues: Issue[];
  comments: Comment[];
  labels: Label[];
  activities: Activity[];
  currentIssueDetail: (Issue & { comments?: Comment[]; activities?: Activity[] }) | null;
  isLoading: boolean;
  error: string | null;

  // Issue Actions
  fetchIssues: (projectId?: string, filters?: any, silent?: boolean) => Promise<void>;
  fetchIssueDetail: (id: string, silent?: boolean) => Promise<void>;
  createIssue: (params: CreateIssueParams) => Promise<Issue | null>;
  updateIssue: (issueId: string, updates: Partial<UpdateIssuePayload>) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus, modifier?: User) => Promise<void>;

  // Comment Actions
  addComment: (issueId: string, content: string) => Promise<Comment | null>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Label Actions
  fetchLabels: (projectId: string, silent?: boolean) => Promise<void>;
  createLabel: (projectId: string, name: string) => Promise<Label | null>;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  comments: [],
  labels: [],
  activities: [],
  currentIssueDetail: null,
  isLoading: false,
  error: null,

  fetchIssues: async (projectId?: string, filters?: any, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await issueApi.getAll({
        projectId,
        limit: 100,
        ...filters,
      });
      set({ issues: res.issues, isLoading: false });
    } catch (err: any) {
      if (!silent) {
        set({ error: err.message || 'Failed to fetch issues', isLoading: false });
      }
    }
  },

  fetchIssueDetail: async (id: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const detail = await issueApi.getById(id);
      set({
        currentIssueDetail: detail,
        comments: detail.comments || [],
        activities: detail.activities || [],
        isLoading: false,
      });
    } catch (err: any) {
      if (!silent) {
        set({ error: err.message || 'Failed to load issue details', isLoading: false });
      }
    }
  },

  createIssue: async (params: CreateIssueParams) => {
    try {
      const payload: CreateIssuePayload = {
        projectId: params.projectId,
        title: params.title,
        description: params.description,
        type: params.type,
        status: params.status,
        priority: params.priority,
        assigneeId: params.assignee ? params.assignee.id : undefined,
        dueDate: params.dueDate,
        labelIds: params.labels ? params.labels.map((l) => l.id) : [],
      };

      const newIssue = await issueApi.create(payload);
      set((state) => ({
        issues: [newIssue, ...state.issues],
      }));
      return newIssue;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create issue' });
      return null;
    }
  },

  updateIssue: async (issueId: string, updates: Partial<UpdateIssuePayload>) => {
    try {
      const updated = await issueApi.update(issueId, updates);
      set((state) => ({
        issues: state.issues.map((i) => (i.id === issueId ? updated : i)),
        currentIssueDetail:
          state.currentIssueDetail?.id === issueId
            ? { ...state.currentIssueDetail, ...updated }
            : state.currentIssueDetail,
      }));

      // Refresh activity log for this issue
      const activities = await issueApi.getActivities(issueId);
      set({ activities });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update issue' });
    }
  },

  moveIssueStatus: async (issueId: string, newStatus: IssueStatus) => {
    const previousIssues = get().issues;
    const current = previousIssues.find((i) => i.id === issueId);
    if (!current || current.status === newStatus) return;

    // 1. Optimistic local update for instant UI feedback
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === issueId ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i,
      ),
    }));

    // 2. Persist change via API
    try {
      await issueApi.update(issueId, { status: newStatus });
    } catch (err: any) {
      // Revert upon failure
      set({ issues: previousIssues, error: err.message || 'Failed to move issue' });
    }
  },

  deleteIssue: async (issueId: string) => {
    try {
      await issueApi.delete(issueId);
      set((state) => ({
        issues: state.issues.filter((i) => i.id !== issueId),
        currentIssueDetail:
          state.currentIssueDetail?.id === issueId ? null : state.currentIssueDetail,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete issue' });
    }
  },

  addComment: async (issueId: string, content: string) => {
    try {
      const newComment = await commentApi.create(issueId, content);
      set((state) => ({
        comments: [...state.comments, newComment],
        issues: state.issues.map((i) =>
          i.id === issueId ? { ...i, commentsCount: (i.commentsCount || 0) + 1 } : i,
        ),
      }));

      // Refresh activity log
      const activities = await issueApi.getActivities(issueId);
      set({ activities });

      return newComment;
    } catch (err: any) {
      set({ error: err.message || 'Failed to post comment' });
      return null;
    }
  },

  updateComment: async (commentId: string, content: string) => {
    try {
      const updated = await commentApi.update(commentId, content);
      set((state) => ({
        comments: state.comments.map((c) => (c.id === commentId ? updated : c)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update comment' });
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      await commentApi.delete(commentId);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete comment' });
    }
  },

  fetchLabels: async (projectId: string) => {
    try {
      const labels = await projectApi.getLabels(projectId);
      set({ labels });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch labels' });
    }
  },

  createLabel: async (projectId: string, name: string) => {
    try {
      const newLabel = await projectApi.createLabel(projectId, name);
      set((state) => ({ labels: [...state.labels, newLabel] }));
      return newLabel;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create label' });
      return null;
    }
  },
}));
