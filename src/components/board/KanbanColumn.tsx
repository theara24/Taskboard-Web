import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Issue, IssueStatus } from '../../types';
import { IssueCard } from './IssueCard';
import { useUIStore } from '../../store/uiStore';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  id: IssueStatus;
  title: string;
  issues: Issue[];
  color: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  issues,
  color,
}) => {
  const { setSelectedIssueId, openCreateIssueModal } = useUIStore();

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[340px] bg-slate-100/75 rounded-2xl p-3 border border-slate-200/80 shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', color)} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
            {issues.length}
          </span>
        </div>

        <button
          onClick={openCreateIssueModal}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          title={`Add issue to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto min-h-[300px] rounded-xl p-1 transition-colors',
              snapshot.isDraggingOver && 'bg-slate-200/60 ring-2 ring-brand-500/20',
            )}
          >
            {issues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index}
                onClick={() => setSelectedIssueId(issue.id)}
              />
            ))}
            {provided.placeholder}

            {issues.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">
                  No issues in this column
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
