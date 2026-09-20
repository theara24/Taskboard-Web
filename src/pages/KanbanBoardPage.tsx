import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useIssueStore } from '../store/issueStore';
import { useUIStore } from '../store/uiStore';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { FilterBar } from '../components/issues/FilterBar';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { Plus, Users } from 'lucide-react';

export const KanbanBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjectStore();
  const { issues } = useIssueStore();
  const { filters, searchQuery, openCreateIssueModal } = useUIStore();

  const project = projects.find((p) => p.id === projectId);

  // If project doesn't exist, redirect to projects page
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  // Filter project issues
  const allProjectIssues = useMemo(() => {
    return issues.filter((i) => i.projectId === project.id);
  }, [issues, project.id]);

  const filteredIssues = useMemo(() => {
    return allProjectIssues.filter((issue) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesKey = issue.issueKey.toLowerCase().includes(query);
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDesc = issue.description?.toLowerCase().includes(query);
        if (!matchesKey && !matchesTitle && !matchesDesc) return false;
      }

      // Status
      if (filters.status && filters.status !== 'ALL' && issue.status !== filters.status) {
        return false;
      }

      // Priority
      if (
        filters.priority &&
        filters.priority !== 'ALL' &&
        issue.priority !== filters.priority
      ) {
        return false;
      }

      // Type
      if (filters.type && filters.type !== 'ALL' && issue.type !== filters.type) {
        return false;
      }

      // Assignee
      if (
        filters.assigneeId &&
        filters.assigneeId !== 'ALL' &&
        issue.assigneeId !== filters.assigneeId
      ) {
        return false;
      }

      // Label
      if (
        filters.labelId &&
        filters.labelId !== 'ALL' &&
        !issue.labels.some((l) => l.id === filters.labelId)
      ) {
        return false;
      }

      return true;
    });
  }, [allProjectIssues, searchQuery, filters]);

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {project.key}
            </span>
            <span className="text-xs text-slate-400">• Kanban Board</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {project.name}
          </h1>
        </div>

        {/* Right side: Member Avatars and Create Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2 overflow-hidden py-1">
            {project.members.map((m) => (
              <div key={m.userId} title={`${m.user.name} (${m.role})`}>
                <UserAvatar user={m.user} size="sm" className="ring-2 ring-white" />
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={openCreateIssueModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Issue
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        projectId={project.id}
        totalFiltered={filteredIssues.length}
        totalIssues={allProjectIssues.length}
      />

      {/* Kanban Board Container with Dnd */}
      <KanbanBoard issues={filteredIssues} />
    </div>
  );
};
