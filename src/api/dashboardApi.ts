import { apiClient } from './client';
import { Issue } from '../types';

export interface DashboardMetrics {
  totalProjects: number;
  totalIssues: number;
  openIssues: number;
  completedIssues: number;
  criticalIssues: number;
  statusCounts: {
    BACKLOG: number;
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
  priorityCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recentIssues: Issue[];
  projects: Array<{ id: string; key: string; name: string; updatedAt: string }>;
}

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    return apiClient.get<DashboardMetrics>('/dashboard');
  },
};
