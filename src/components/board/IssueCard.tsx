import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Issue } from '../../types';
import { PriorityBadge, IssueTypeBadge } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import { Calendar, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

interface IssueCardProps {
  issue: Issue;
  index: number;
  onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, index, onClick }) => {
  const isOverdue =
    issue.dueDate &&
    issue.status !== 'DONE' &&
    new Date(issue.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer select-none mb-2.5',
            snapshot.isDragging && 'rotate-1 shadow-xl ring-2 ring-brand-500/20 border-brand-500',
          )}
        >
          {/* Top Row: Type, Issue Key, Priority */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <IssueTypeBadge type={issue.type} />
              <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-brand-600 transition-colors">
                {issue.issueKey}
              </span>
            </div>
            <PriorityBadge priority={issue.priority} />
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-slate-900 leading-snug">
            {issue.title}
          </h4>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {issue.labels.slice(0, 3).map((l) => (
                <span
                  key={l.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {l.name}
                </span>
              ))}
              {issue.labels.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium self-center">
                  +{issue.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bottom Row: Due Date, Comments, Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              {issue.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-medium',
                    isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500',
                  )}
                  title={isOverdue ? 'Overdue!' : 'Due Date'}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(issue.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {(issue.commentsCount || 0) > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{issue.commentsCount}</span>
                </div>
              )}
            </div>

            <UserAvatar user={issue.assignee} size="xs" />
          </div>
        </div>
      )}
    </Draggable>
  );
};
