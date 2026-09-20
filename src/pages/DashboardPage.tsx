import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { dashboardApi, DashboardMetrics } from '../api/dashboardApi';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge, IssueTypeBadge } from '../components/common/Badge';
import { UserAvatar } from '../components/common/UserAvatar';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { openCreateIssueModal, setSelectedIssueId } = useUIStore();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = React.useCallback((isInitial = false) => {
    if (isInitial) setLoading(true);
    dashboardApi
      .getMetrics()
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard metrics:', err);
      })
      .finally(() => {
        if (isInitial) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProjects();
    loadMetrics(true);

    const handleFocus = () => {
      if (!document.hidden) {
        fetchProjects(true);
        loadMetrics(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchProjects(true);
        loadMetrics(false);
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchProjects, loadMetrics]);

  // Fallbacks if metrics loading
  const totalProjects = metrics?.totalProjects ?? projects.length;
  const totalIssues = metrics?.totalIssues ?? 0;
  const openIssues = metrics?.openIssues ?? 0;
  const completedIssues = metrics?.completedIssues ?? 0;
  const urgentIssues = metrics?.criticalIssues ?? 0;

  const completionRate =
    totalIssues === 0 ? 0 : Math.round((completedIssues / totalIssues) * 100);

  const recentIssues = metrics?.recentIssues ?? [];

  const backlogCount = metrics?.statusCounts?.BACKLOG ?? 0;
  const todoCount = metrics?.statusCounts?.TODO ?? 0;
  const inProgressCount = metrics?.statusCounts?.IN_PROGRESS ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 md:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-3 text-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            Full-Stack Project Management
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser?.name || 'Developer'}!
          </h1>
          <p className="text-sm text-blue-200 mt-1 max-w-xl">
            You have <strong className="text-white">{openIssues}</strong> open issues across{' '}
            <strong className="text-white">{totalProjects}</strong> active projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsNewProjectModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            New Project
          </Button>
          <Button
            variant="primary"
            onClick={openCreateIssueModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
          >
            Create Issue
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Projects
                </span>
                <FolderKanban className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {totalProjects}
              </div>
              <p className="text-xs text-slate-400 mt-1">Active workspaces</p>
            </div>

            {/* Total Issues */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Issues
                </span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {totalIssues}
              </div>
              <p className="text-xs text-slate-400 mt-1">{openIssues} currently open</p>
            </div>

            {/* Completed */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Completed
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                {completedIssues}
              </div>
              <p className="text-xs text-slate-400 mt-1">{completionRate}% total completion</p>
            </div>

            {/* Urgent / High Priority */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Urgent / Critical
                </span>
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-rose-600">
                {urgentIssues}
              </div>
              <p className="text-xs text-slate-400 mt-1">Require prompt attention</p>
            </div>
          </div>

          {/* Visual Progress & Distribution Overview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Issue Lifecycle Progress</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {completedIssues} of {totalIssues} Done ({completionRate}%)
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden">
              <div
                style={{ width: `${totalIssues ? (backlogCount / totalIssues) * 100 : 0}%` }}
                className="bg-slate-400"
                title={`Backlog: ${backlogCount}`}
              />
              <div
                style={{ width: `${totalIssues ? (todoCount / totalIssues) * 100 : 0}%` }}
                className="bg-indigo-500"
                title={`To Do: ${todoCount}`}
              />
              <div
                style={{ width: `${totalIssues ? (inProgressCount / totalIssues) * 100 : 0}%` }}
                className="bg-amber-500"
                title={`In Progress: ${inProgressCount}`}
              />
              <div
                style={{ width: `${totalIssues ? (completedIssues / totalIssues) * 100 : 0}%` }}
                className="bg-emerald-500"
                title={`Done: ${completedIssues}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Backlog ({backlogCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>To Do ({todoCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>In Progress ({inProgressCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Done ({completedIssues})</span>
              </div>
            </div>
          </div>

          {/* Recently Updated Issues Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recently Updated Issues</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live PostgreSQL feed</p>
              </div>
              <button
                onClick={() => {
                  if (projects[0]) {
                    navigate(`/projects/${projects[0].id}/issues`);
                  }
                }}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all issues
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentIssues.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                No issues found yet. Click "Create Issue" to create your first task!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <IssueTypeBadge type={issue.type} />
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                            {issue.issueKey}
                          </span>
                        </div>
                        <PriorityBadge priority={issue.priority} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                        {issue.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <StatusBadge status={issue.status} />
                      <UserAvatar user={issue.assignee} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};
