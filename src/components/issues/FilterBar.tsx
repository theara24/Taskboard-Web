import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useIssueStore } from '../../store/issueStore';
import { Filter, X, ArrowUpDown, Search } from 'lucide-react';
import { IssuePriority, IssueStatus, IssueType } from '../../types';

interface FilterBarProps {
  projectId: string;
  totalFiltered: number;
  totalIssues: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  projectId,
  totalFiltered,
  totalIssues,
}) => {
  const { filters, setFilter, resetFilters, searchQuery, setSearchQuery } = useUIStore();
  const { projects } = useProjectStore();
  const { labels } = useIssueStore();

  const project = projects.find((p) => p.id === projectId);
  const projectLabels = labels.filter((l) => l.projectId === projectId);

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.assigneeId !== 'ALL' ||
    filters.labelId !== 'ALL' ||
    Boolean(searchQuery);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6 space-y-3">
      {/* Top Filter Row: Search & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by key, title, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Quick Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value as IssueStatus | 'ALL')}
            className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Status: All</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value as IssuePriority | 'ALL')}
            className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value as IssueType | 'ALL')}
            className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Type: All</option>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
          </select>

          {/* Assignee */}
          <select
            value={filters.assigneeId}
            onChange={(e) => setFilter('assigneeId', e.target.value)}
            className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Assignee: All</option>
            {project?.members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>

          {/* Label */}
          {projectLabels.length > 0 && (
            <select
              value={filters.labelId}
              onChange={(e) => setFilter('labelId', e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">Label: All</option>
              {projectLabels.map((l) => (
                <option key={l.id} value={l.id}>
                  #{l.name}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value as any)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="updatedAt">Updated Date</option>
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Status Bar: Result Count & Clear Button */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Showing <strong className="text-slate-800">{totalFiltered}</strong> of{' '}
            <strong className="text-slate-800">{totalIssues}</strong> issues
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
