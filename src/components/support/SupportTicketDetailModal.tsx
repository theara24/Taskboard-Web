import React, { useState, useEffect } from 'react';
import { useSupportStore } from '../../store/supportStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import {
  LifeBuoy,
  Send,
  Clock,
  User as UserIcon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Tag,
} from 'lucide-react';
import { SupportStatus, SupportPriority, SupportCategory } from '../../types';

interface SupportTicketDetailModalProps {
  ticketId: string | null;
  onClose: () => void;
}

export const SupportTicketDetailModal: React.FC<SupportTicketDetailModalProps> = ({
  ticketId,
  onClose,
}) => {
  const { currentUser } = useAuthStore();
  const {
    currentTicketDetail,
    fetchTicketDetail,
    addMessage,
    updateStatus,
    updatePriority,
    isLoading,
  } = useSupportStore();
  const { showToast } = useUIStore();

  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetail(ticketId);

      const handleFocus = () => {
        if (!document.hidden) {
          fetchTicketDetail(ticketId, true);
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchTicketDetail(ticketId, true);
        }
      }, 4000);

      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
        clearInterval(interval);
      };
    }
  }, [ticketId, fetchTicketDetail]);

  if (!ticketId) return null;

  const ticket = currentTicketDetail;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticket) return;

    setIsSending(true);
    const result = await addMessage(ticket.id, replyMessage.trim());
    setIsSending(false);

    if (result) {
      setReplyMessage('');
      showToast('success', 'Reply posted');
    } else {
      showToast('error', 'Failed to send reply');
    }
  };

  const handleStatusChange = async (newStatus: SupportStatus) => {
    if (!ticket) return;
    const ok = await updateStatus(ticket.id, newStatus);
    if (ok) {
      showToast('success', `Status updated to ${newStatus}`);
    } else {
      showToast('error', 'Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: SupportPriority) => {
    if (!ticket) return;
    const ok = await updatePriority(ticket.id, newPriority);
    if (ok) {
      showToast('success', `Priority updated to ${newPriority}`);
    } else {
      showToast('error', 'Failed to update priority');
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

  return (
    <Modal isOpen={Boolean(ticketId)} onClose={onClose} title={`Support Ticket ${ticket?.ticketKey || ''}`}>
      {!ticket && isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : !ticket ? (
        <div className="text-center p-8 text-slate-500">Support ticket not found.</div>
      ) : (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
          {/* Ticket Header & Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800">
                  {ticket.ticketKey}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                  {ticket.priority} PRIORITY
                </span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {ticket.subject}
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <UserAvatar user={ticket.user} className="w-5 h-5" />
                <span className="font-medium">{ticket.user.name}</span>
                <span className="text-slate-400">({ticket.user.email})</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold uppercase tracking-wider">{ticket.category}</span>
              </div>
            </div>
          </div>

          {/* Admin Control Bar */}
          {isAdmin && (
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Shield className="w-4 h-4" />
                <span>Admin Ticket Controls:</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as SupportStatus)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Priority:</span>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as SupportPriority)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Conversation Thread
            </h4>

            {ticket.messages && ticket.messages.length > 0 ? (
              <div className="space-y-3">
                {ticket.messages.map((msg) => {
                  const isMsgAdmin = msg.user.role === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMsgAdmin
                          ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-800/70 ml-4'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={msg.user} className="w-6 h-6" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {msg.user.name}
                          </span>
                          {isMsgAdmin && (
                            <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-purple-600 text-white tracking-wider">
                              ADMIN SUPPORT
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No messages recorded yet.</p>
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Post Reply
            </label>
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={isAdmin ? 'Type official support response...' : 'Type your message or follow-up details...'}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSending || !replyMessage.trim()}
                leftIcon={isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                className={isAdmin ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
              >
                {isSending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
