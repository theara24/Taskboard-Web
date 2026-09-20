export type Role = 'ADMIN' | 'USER';

export type ProjectMemberRole = 'OWNER' | 'MEMBER';

export type IssueType = 'TASK' | 'BUG' | 'FEATURE';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  ownerId: string;
  owner: User;
  issueCounter: number;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  projectId: string;
  color?: string;
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  issueId: string;
  userId: string;
  user: User;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
}

export interface Issue {
  id: string;
  issueKey: string; // e.g. "WEB-1"
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  dueDate?: string | null;
  projectId: string;
  reporterId: string;
  reporter: User;
  assigneeId?: string | null;
  assignee?: User | null;
  labels: Label[];
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueFilters {
  status?: IssueStatus | 'ALL';
  priority?: IssuePriority | 'ALL';
  type?: IssueType | 'ALL';
  assigneeId?: string | 'ALL';
  labelId?: string | 'ALL';
  searchQuery?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type NotificationType =
  | 'PROJECT_INVITATION'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_DECLINED'
  | 'ISSUE_ASSIGNED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    invitationId?: string;
    projectId?: string;
    projectName?: string;
    projectKey?: string;
    inviterName?: string;
    role?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeId?: string | null;
  role: ProjectMemberRole;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    key: string;
  };
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
}
