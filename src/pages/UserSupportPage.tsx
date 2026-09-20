import React, { useState, useEffect } from 'react';
import { useSupportStore } from '../store/supportStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { SupportTicketDetailModal } from '../components/support/SupportTicketDetailModal';
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { SupportCategory, SupportPriority, SupportStatus } from '../types';
import { SEOHead } from '../components/common/SEOHead';

export const UserSupportPage: React.FC = () => {
  const { userTickets, userPagination, fetchUserTickets, createTicket, isLoading } = useSupportStore();
  const { showToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('AUTHENTICATION');
  const [priority, setPriority] = useState<SupportPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserTickets();

    const handleFocus = () => {
      if (!document.hidden) {
        fetchUserTickets(undefined, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUserTickets(undefined, true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchUserTickets]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const newTicket = await createTicket({
      subject: subject.trim(),
      category,
      priority,
      description: description.trim(),
    });
    setIsSubmitting(false);

    if (newTicket) {
      showToast('success', `Support ticket ${newTicket.ticketKey} submitted`);
      setIsCreateModalOpen(false);
      setSubject('');
      setDescription('');
      setSelectedTicketId(newTicket.id);
    } else {
      showToast('error', 'Failed to submit support ticket');
    }
  };

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

  const filteredTickets = userTickets.filter(
    (t: any) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketKey.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <SEOHead
        title="Help & Support Center"
        description="Submit tickets and request assistance directly from TaskBoard platform administrators."
      />
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Help & Support Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit platform tickets to get assistance from TaskBoard Administrators
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Create Support Ticket
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <span className="font-bold">Platform Support vs Project Issues:</span>
          <p className="text-blue-700 dark:text-blue-300">
            Use this Support Center to report issues with your account, authentication, project access, or TaskBoard platform bugs. For work tasks inside your project, use the Kanban Board.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search my support tickets..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Tickets List */}
      {isLoading && userTickets.length === 0 ? (
        <div className="flex justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          title="No support tickets found"
          description={search ? 'No tickets match your search query.' : 'You have not submitted any support tickets yet.'}
          actionText="Submit First Ticket"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket: any) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800">
                    {ticket.ticketKey}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {ticket.subject}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {ticket.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                <div className="flex items-center gap-1 text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium uppercase tracking-wider">{ticket.category}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:underline">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{ticket._count?.messages ?? 0} messages</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Support Ticket Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Google login error during sign-in"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="AUTHENTICATION">Authentication / Login</option>
                <option value="ACCOUNT">Account Management</option>
                <option value="PROJECT">Project Access</option>
                <option value="BUG">Platform Bug</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportPriority)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail so platform administrators can help..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !subject.trim() || !description.trim()}
              leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Ticket Detail Modal */}
      <SupportTicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
