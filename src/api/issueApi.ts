import { apiClient } from './client';
import { Issue, Activity, IssueStatus, IssuePriority, IssueType, Label } from '../types';

export interface CreateIssuePayload {
  projectId: string;
  title: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
}

export interface IssueListParams {
  projectId?: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IssueListResponse {
  issues: Issue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Normalizer to ensure consistent frontend Issue format
export function normalizeIssue(raw: any): Issue {
  if (!raw) return raw;

  const labels: Label[] = Array.isArray(raw.labels)
    ? raw.labels.map((item: any) => {
        if (item.label) {
          return {
            id: item.label.id,
            name: item.label.name,
            projectId: item.label.projectId || raw.projectId,
            color: item.label.color,
          };
        }
        return item;
      })
    : [];

  return {
    id: raw.id,
    issueKey: raw.issueKey,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    status: raw.status,
    priority: raw.priority,
    dueDate: raw.dueDate,
    projectId: raw.projectId,
    reporterId: raw.reporterId,
    reporter: raw.reporter || {
      id: raw.reporterId,
      name: 'Unknown',
      email: '',
      role: 'USER',
    },
    assigneeId: raw.assigneeId,
    assignee: raw.assignee,
    labels,
    commentsCount: raw._count?.comments ?? raw.commentsCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const issueApi = {
  getAll: async (params?: IssueListParams): Promise<IssueListResponse> => {
    let url = '/issues';
    const queryParams: Record<string, any> = {};

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (
          val !== undefined &&
          val !== null &&
          val !== '' &&
          val !== 'ALL' &&
          val !== 'null' &&
          val !== 'undefined'
        ) {
          queryParams[key] = val;
        }
      });
    }

    if (queryParams.projectId) {
      url = `/projects/${queryParams.projectId}/issues`;
      delete queryParams.projectId;
    }

    const raw = await apiClient.get<any>(url, { params: queryParams });
    if (raw && Array.isArray(raw.issues)) {
      return {
        issues: raw.issues.map(normalizeIssue),
        pagination: raw.pagination,
      };
    }
    if (Array.isArray(raw)) {
      return {
        issues: raw.map(normalizeIssue),
        pagination: { total: raw.length, page: 1, limit: raw.length, totalPages: 1 },
      };
    }
    return { issues: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };
  },

  getById: async (id: string): Promise<Issue & { comments?: any[]; activities?: Activity[] }> => {
    const raw = await apiClient.get<any>(`/issues/${id}`);
    const normalized = normalizeIssue(raw);
    return {
      ...normalized,
      comments: raw.comments || [],
      activities: raw.activities || [],
    };
  },

  create: async (data: CreateIssuePayload): Promise<Issue> => {
    const { projectId, ...body } = data;
    const cleanBody = {
      ...body,
      assigneeId: body.assigneeId || null,
      dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
    };
    const raw = await apiClient.post<any>(`/projects/${projectId}/issues`, cleanBody);
    return normalizeIssue(raw);
  },

  update: async (id: string, data: UpdateIssuePayload): Promise<Issue> => {
    const cleanBody = {
      ...data,
      ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId || null } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null }
        : {}),
    };
    const raw = await apiClient.patch<any>(`/issues/${id}`, cleanBody);
    return normalizeIssue(raw);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/issues/${id}`);
  },

  getActivities: async (id: string): Promise<Activity[]> => {
    return apiClient.get<Activity[]>(`/issues/${id}/activities`);
  },
};
