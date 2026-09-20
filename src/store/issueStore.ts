import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Issue, Comment, Label, Activity, IssueStatus, IssuePriority, IssueType, User } from '../types';
import {
  INITIAL_ISSUES,
  INITIAL_COMMENTS,
  INITIAL_LABELS,
  INITIAL_ACTIVITIES,
} from '../mock/initial-data';
import { useProjectStore } from './projectStore';

interface CreateIssueParams {
  projectId: string;
  reporter: User;
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

  // Issue Actions
  createIssue: (params: CreateIssueParams) => Issue;
  updateIssue: (
    issueId: string,
    updates: Partial<Omit<Issue, 'id' | 'issueKey' | 'projectId' | 'reporterId'>>,
    modifier: User,
  ) => void;
  deleteIssue: (issueId: string) => void;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus, modifier: User) => void;

  // Comment Actions
  addComment: (issueId: string, author: User, content: string) => Comment;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;

  // Label Actions
  createLabel: (projectId: string, name: string, color?: string) => Label;
}

export const useIssueStore = create<IssueState>()(
  persist(
    (set, get) => ({
      issues: INITIAL_ISSUES,
      comments: INITIAL_COMMENTS,
      labels: INITIAL_LABELS,
      activities: INITIAL_ACTIVITIES,

      createIssue: (params) => {
        const project = useProjectStore
          .getState()
          .projects.find((p) => p.id === params.projectId);

        const projectKey = project ? project.key : 'TASK';
        const currentIssuesCount = get().issues.filter(
          (i) => i.projectId === params.projectId,
        ).length;

        const nextNumber = currentIssuesCount + 1;
        const issueKey = `${projectKey}-${nextNumber}`;

        const newIssue: Issue = {
          id: `iss-${Date.now()}`,
          issueKey,
          title: params.title.trim(),
          description: params.description?.trim(),
          type: params.type,
          status: params.status,
          priority: params.priority,
          dueDate: params.dueDate || null,
          projectId: params.projectId,
          reporterId: params.reporter.id,
          reporter: params.reporter,
          assigneeId: params.assignee ? params.assignee.id : null,
          assignee: params.assignee || null,
          labels: params.labels || [],
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          issueId: newIssue.id,
          userId: params.reporter.id,
          user: params.reporter,
          action: 'ISSUE_CREATED',
          newValue: `Issue ${issueKey} created as ${newIssue.type} with ${newIssue.priority} priority`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          issues: [newIssue, ...state.issues],
          activities: [newActivity, ...state.activities],
        }));

        return newIssue;
      },

      updateIssue: (issueId, updates, modifier) => {
        const existing = get().issues.find((i) => i.id === issueId);
        if (!existing) return;

        const activitiesToAppend: Activity[] = [];

        if (updates.status && updates.status !== existing.status) {
          activitiesToAppend.push({
            id: `act-${Date.now()}-status`,
            issueId,
            userId: modifier.id,
            user: modifier,
            action: 'STATUS_CHANGED',
            oldValue: existing.status,
            newValue: updates.status,
            createdAt: new Date().toISOString(),
          });
        }

        if (updates.priority && updates.priority !== existing.priority) {
          activitiesToAppend.push({
            id: `act-${Date.now()}-priority`,
            issueId,
            userId: modifier.id,
            user: modifier,
            action: 'PRIORITY_CHANGED',
            oldValue: existing.priority,
            newValue: updates.priority,
            createdAt: new Date().toISOString(),
          });
        }

        if (updates.assignee !== undefined && updates.assignee?.id !== existing.assignee?.id) {
          activitiesToAppend.push({
            id: `act-${Date.now()}-assignee`,
            issueId,
            userId: modifier.id,
            user: modifier,
            action: 'ASSIGNEE_CHANGED',
            oldValue: existing.assignee?.name || 'Unassigned',
            newValue: updates.assignee?.name || 'Unassigned',
            createdAt: new Date().toISOString(),
          });
        }

        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === issueId
              ? {
                  ...issue,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : issue,
          ),
          activities: [...activitiesToAppend, ...state.activities],
        }));
      },

      deleteIssue: (issueId) => {
        set((state) => ({
          issues: state.issues.filter((i) => i.id !== issueId),
          comments: state.comments.filter((c) => c.issueId !== issueId),
          activities: state.activities.filter((a) => a.issueId !== issueId),
        }));
      },

      moveIssueStatus: (issueId, newStatus, modifier) => {
        const existing = get().issues.find((i) => i.id === issueId);
        if (!existing || existing.status === newStatus) return;

        const newActivity: Activity = {
          id: `act-${Date.now()}-move`,
          issueId,
          userId: modifier.id,
          user: modifier,
          action: 'STATUS_CHANGED',
          oldValue: existing.status,
          newValue: newStatus,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : i,
          ),
          activities: [newActivity, ...state.activities],
        }));
      },

      addComment: (issueId, author, content) => {
        const newComment: Comment = {
          id: `cmt-${Date.now()}`,
          content: content.trim(),
          issueId,
          authorId: author.id,
          author,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newActivity: Activity = {
          id: `act-${Date.now()}-comment`,
          issueId,
          userId: author.id,
          user: author,
          action: 'COMMENT_ADDED',
          newValue: content.length > 60 ? content.slice(0, 57) + '...' : content,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comments: [...state.comments, newComment],
          activities: [newActivity, ...state.activities],
          issues: state.issues.map((i) =>
            i.id === issueId
              ? {
                  ...i,
                  commentsCount: (i.commentsCount || 0) + 1,
                  updatedAt: new Date().toISOString(),
                }
              : i,
          ),
        }));

        return newComment;
      },

      updateComment: (commentId, content) => {
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  content: content.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        }));
      },

      deleteComment: (commentId) => {
        const comment = get().comments.find((c) => c.id === commentId);
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId),
          issues: comment
            ? state.issues.map((i) =>
                i.id === comment.issueId
                  ? {
                      ...i,
                      commentsCount: Math.max(0, (i.commentsCount || 1) - 1),
                    }
                  : i,
              )
            : state.issues,
        }));
      },

      createLabel: (projectId, name, color = '#3b82f6') => {
        const newLabel: Label = {
          id: `lbl-${Date.now()}`,
          name: name.trim().toLowerCase(),
          projectId,
          color,
        };

        set((state) => ({
          labels: [...state.labels, newLabel],
        }));

        return newLabel;
      },
    }),
    {
      name: 'taskboard_issues_v1',
    },
  ),
);
