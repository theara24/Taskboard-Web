import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { UserAvatar } from '../components/common/UserAvatar';
import { Button } from '../components/common/Button';
import {
  Users,
  FolderKanban,
  ListTodo,
  LifeBuoy,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  Database,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, fetchMetrics, isLoading } = useAdminStore();

  useEffect(() => {
    fetchMetrics();

    const handleFocus = () => {
      if (!document.hidden) {
        fetchMetrics(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMetrics(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchMetrics]);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const userTotal = metrics?.users.total ?? 0;
  const userNewThisWeek = metrics?.users.newThisWeek ?? 0;

  const projectTotal = metrics?.projects.total ?? 0;
  const projectNewThisWeek = metrics?.projects.newThisWeek ?? 0;

  const issueTotal = metrics?.issues.total ?? 0;
  const issueCreatedThisWeek = metrics?.issues.createdThisWeek ?? 0;

  const supportTotal = metrics?.support.total ?? 0;
  const supportOpen = metrics?.support.open ?? 0;
  const supportInProgress = metrics?.support.inProgress ?? 0;
  const supportResolved = metrics?.support.resolved ?? 0;
  const supportUrgent = metrics?.support.urgent ?? 0;

  const totalIssueDist = (metrics?.issueStatusDistribution.BACKLOG ?? 0) +
    (metrics?.issueStatusDistribution.TODO ?? 0) +
    (metrics?.issueStatusDistribution.IN_PROGRESS ?? 0) +
    (metrics?.issueStatusDistribution.DONE ?? 0) || 1;

  const getPercent = (count: number) => Math.round((count / totalIssueDist) * 100);

  return (
    <div className="space-y-8">
      <SEOHead
        title="Admin Dashboard"
        description="Platform administration, system metrics, user growth, and service health monitoring."
      />
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Platform Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Admin Dashboard & Monitoring
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time platform metrics, system health, user analytics, and support overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/users')}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Manage Users
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/support')}
            leftIcon={<LifeBuoy className="w-4 h-4" />}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Support Center
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {userTotal}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +{userNewThisWeek} this week
            </span>
          </div>
        </div>

        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {projectTotal}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +{projectNewThisWeek} this week
            </span>
          </div>
        </div>

        {/* Total Issues */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Issues</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {issueTotal}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +{issueCreatedThisWeek} this week
            </span>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Support Tickets</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {supportTotal}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-amber-600 dark:text-amber-400">{supportOpen} open</span>
              {supportUrgent > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-[10px]">
                  {supportUrgent} urgent
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Platform Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Registration Growth (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily new accounts registered on TaskBoard</p>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {metrics?.userGrowth.map((g: { date: string; count: number }, idx: number) => {
              const maxCount = Math.max(...metrics.userGrowth.map((x: { date: string; count: number }) => x.count), 1);
              const heightPercent = Math.max(15, Math.round((g.count / maxCount) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {g.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-purple-600 to-indigo-500 dark:from-purple-500 dark:to-indigo-400 transition-all hover:brightness-110"
                  />
                  <span className="text-[11px] font-semibold text-slate-400">{g.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Health Monitoring */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Platform Overview & Health
            </h3>
            <p className="text-xs text-slate-400">Real-time database and service status</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">PostgreSQL Database</div>
                  <div className="text-[11px] text-slate-400">Port 5433 • Connected</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">TaskBoard API Service</div>
                  <div className="text-[11px] text-slate-400">Port 5000 • Express TS</div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>
          </div>

          {/* Issue Status Distribution */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issue Status Distribution
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Backlog ({metrics?.issueStatusDistribution.BACKLOG})</span>
                <span className="font-bold">{getPercent(metrics?.issueStatusDistribution.BACKLOG ?? 0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${getPercent(metrics?.issueStatusDistribution.BACKLOG ?? 0)}%` }} className="h-full bg-slate-400" />
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                <span>In Progress ({metrics?.issueStatusDistribution.IN_PROGRESS})</span>
                <span className="font-bold">{getPercent(metrics?.issueStatusDistribution.IN_PROGRESS ?? 0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${getPercent(metrics?.issueStatusDistribution.IN_PROGRESS ?? 0)}%` }} className="h-full bg-amber-500" />
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                <span>Done ({metrics?.issueStatusDistribution.DONE})</span>
                <span className="font-bold">{getPercent(metrics?.issueStatusDistribution.DONE ?? 0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${getPercent(metrics?.issueStatusDistribution.DONE ?? 0)}%` }} className="h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Widget & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets Widget */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-600" />
                Support Ticket Widget
              </h3>
              <p className="text-xs text-slate-400">Recent user support inquiries requiring administrator attention</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/support')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-purple-600 hover:text-purple-700"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
              <div className="font-bold text-lg">{supportOpen}</div>
              <div className="text-[11px]">Open</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/60">
              <div className="font-bold text-lg">{supportInProgress}</div>
              <div className="text-[11px]">In Progress</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60">
              <div className="font-bold text-lg">{supportResolved}</div>
              <div className="text-[11px]">Resolved</div>
            </div>
          </div>

          <div className="space-y-2">
            {metrics?.recentTickets && metrics.recentTickets.length > 0 ? (
              metrics.recentTickets.map((t: any) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/admin/support')}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-500 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{t.ticketKey}</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{t.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No recent support tickets.</p>
            )}
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Platform Activity
            </h3>
            <p className="text-xs text-slate-400">Audit stream of registration, project, support, and role events</p>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white leading-snug">{act.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No recent platform activity logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
