import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { Issue, IssueStatus } from '../../types';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

interface KanbanBoardProps {
  issues: Issue[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ issues }) => {
  const { currentUser } = useAuthStore();
  const { moveIssueStatus } = useIssueStore();
  const { showToast } = useUIStore();

  const columns: Array<{ id: IssueStatus; title: string; color: string }> = [
    { id: 'BACKLOG', title: 'Backlog', color: 'bg-slate-400' },
    { id: 'TODO', title: 'To Do', color: 'bg-indigo-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'DONE', title: 'Done', color: 'bg-emerald-500' },
  ];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in the same column at the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as IssueStatus;

    if (currentUser) {
      moveIssueStatus(draggableId, newStatus, currentUser);
      showToast('info', `Moved issue to ${newStatus}`);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[calc(100vh-280px)]">
        {columns.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              issues={colIssues}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
