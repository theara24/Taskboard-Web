import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useIssueStore } from '../store/issueStore';
import { useUIStore } from '../store/uiStore';
import { FilterBar } from '../components/issues/FilterBar';
import { PriorityBadge, StatusBadge, IssueTypeBadge } from '../components/common/Badge';
import { UserAvatar } from '../components/common/UserAvatar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, ArrowUpDown, Calendar, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { Issue, IssuePriority } from '../types';

export const IssuesListPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjectStore();
  const { issues } = useIssueStore();
  const { filters, searchQuery, openCreateIssueModal, setSelectedIssueId } = useUIStore();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const allProjectIssues = useMemo(() => {
    return issues.filter((i) => i.projectId === project.id);
  }, [issues, project.id]);

  const filteredIssues = useMemo(() => {
    return allProjectIssues.filter((issue) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesKey = issue.issueKey.toLowerCase().includes(query);
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDesc = issue.description?.toLowerCase().includes(query);
        if (!matchesKey && !matchesTitle && !matchesDesc) return false;
      }

      if (filters.status && filters.status !== 'ALL' && issue.status !== filters.status) {
        return false;
      }

      if (
        filters.priority &&
        filters.priority !== 'ALL' &&
        issue.priority !== filters.priority
      ) {
        return false;
      }

      if (filters.type && filters.type !== 'ALL' && issue.type !== filters.type) {
        return false;
      }

      if (
        filters.assigneeId &&
        filters.assigneeId !== 'ALL' &&
        issue.assigneeId !== filters.assigneeId
      ) {
        return false;
      }

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

  // Sort
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      const field = filters.sortBy || 'updatedAt';
      if (field === 'priority') {
        const pOrder: Record<IssuePriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      if (field === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (field === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (field === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredIssues, filters.sortBy]);

  // Paginate
  const totalPages = Math.ceil(sortedIssues.length / pageSize) || 1;
  const paginatedIssues = sortedIssues.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {project.key}
            </span>
            <span className="text-xs text-slate-400">• All Issues</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {project.name} Issues
          </h1>
        </div>

        <Button
          variant="primary"
          onClick={openCreateIssueModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Issue
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        projectId={project.id}
        totalFiltered={filteredIssues.length}
        totalIssues={allProjectIssues.length}
      />

      {/* Table Container */}
      {paginatedIssues.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No issues found"
          description="No issues match your current query or filter criteria."
          actionText="Create an Issue"
          onAction={openCreateIssueModal}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3 min-w-[260px]">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      <IssueTypeBadge type={issue.type} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
                      {issue.issueKey}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="line-clamp-1">{issue.title}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <UserAvatar user={issue.assignee} size="xs" showName />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {issue.dueDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(issue.dueDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Page <strong className="text-slate-800">{page}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong> (
              {sortedIssues.length} items)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
