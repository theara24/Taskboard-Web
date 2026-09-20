import React, { useState, useEffect } from 'react';
import { useSupportStore } from '../store/supportStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { UserAvatar } from '../components/common/UserAvatar';
import { SupportTicketDetailModal } from '../components/support/SupportTicketDetailModal';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Clock,
  Filter,
  Shield,
  Loader2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { SupportCategory, SupportPriority, SupportStatus } from '../types';

export const AdminSupportPage: React.FC = () => {
  const { adminTickets, adminPagination, fetchAdminTickets, isLoading } = useSupportStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminTickets({
      status: statusFilter !== 'ALL' ? (statusFilter as SupportStatus) : undefined,
      priority: priorityFilter !== 'ALL' ? (priorityFilter as SupportPriority) : undefined,
      category: categoryFilter !== 'ALL' ? (categoryFilter as SupportCategory) : undefined,
      search: search || undefined,
    });

    const handleFocus = () => {
      if (!document.hidden) {
        fetchAdminTickets(
          {
            status: statusFilter !== 'ALL' ? (statusFilter as SupportStatus) : undefined,
            priority: priorityFilter !== 'ALL' ? (priorityFilter as SupportPriority) : undefined,
            category: categoryFilter !== 'ALL' ? (categoryFilter as SupportCategory) : undefined,
            search: search || undefined,
          },
          true,
        );
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchAdminTickets(
          {
            status: statusFilter !== 'ALL' ? (statusFilter as SupportStatus) : undefined,
            priority: priorityFilter !== 'ALL' ? (priorityFilter as SupportPriority) : undefined,
            category: categoryFilter !== 'ALL' ? (categoryFilter as SupportCategory) : undefined,
            search: search || undefined,
          },
          true,
        );
      }
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchAdminTickets, statusFilter, priorityFilter, categoryFilter, search]);

  const getStatusBadge = (status: SupportStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'RESOLVED':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'CLOSED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityBadge = (priority: SupportPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'HIGH':
        return 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'LOW':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Platform Admin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Support Center Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, inspect, respond, and resolve support tickets submitted across the platform
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, subject, user..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTHENTICATION">AUTHENTICATION</option>
              <option value="ACCOUNT">ACCOUNT</option>
              <option value="PROJECT">PROJECT</option>
              <option value="BUG">BUG</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {isLoading && adminTickets.length === 0 ? (
        <div className="flex justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : adminTickets.length === 0 ? (
        <EmptyState
          title="No support tickets found"
          description="There are currently no tickets matching your filter criteria."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {adminTickets.map((t: any) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {t.ticketKey}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                    {t.subject}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={t.user} className="w-6 h-6" />
                      <div>
                        <div className="font-medium text-xs text-slate-900 dark:text-white">{t.user.name}</div>
                        <div className="text-[11px] text-slate-400">{t.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicketId(t.id);
                      }}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                    >
                      Inspect & Reply
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Detail Modal */}
      <SupportTicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
