import React from 'react';
import { IssuePriority, IssueStatus, IssueType } from '../../types';
import {
  CheckSquare,
  AlertCircle,
  Bookmark,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  className?: string;
}

export const PriorityBadge: React.FC<{ priority: IssuePriority } & BadgeProps> = ({
  priority,
  className,
}) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200',
            className,
          )}
        >
          <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200',
            className,
          )}
        >
          <ArrowUp className="w-3 h-3 text-amber-600" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200',
            className,
          )}
        >
          <Minus className="w-3 h-3 text-blue-500" />
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200',
            className,
          )}
        >
          <ArrowDown className="w-3 h-3 text-slate-500" />
          Low
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: IssueStatus } & BadgeProps> = ({
  status,
  className,
}) => {
  switch (status) {
    case 'BACKLOG':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700',
            className,
          )}
        >
          Backlog
        </span>
      );
    case 'TODO':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200',
            className,
          )}
        >
          To Do
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200',
            className,
          )}
        >
          In Progress
        </span>
      );
    case 'DONE':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200',
            className,
          )}
        >
          Done
        </span>
      );
  }
};

export const IssueTypeBadge: React.FC<{ type: IssueType } & BadgeProps> = ({
  type,
  className,
}) => {
  switch (type) {
    case 'BUG':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200',
            className,
          )}
          title="Bug"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Bug
        </span>
      );
    case 'FEATURE':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200',
            className,
          )}
          title="Feature"
        >
          <Bookmark className="w-3.5 h-3.5 text-purple-600" />
          Feature
        </span>
      );
    case 'TASK':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200',
            className,
          )}
          title="Task"
        >
          <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
          Task
        </span>
      );
  }
};
