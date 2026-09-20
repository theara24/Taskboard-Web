import React, { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import {
  Bell,
  Check,
  CheckCheck,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '../common/Button';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    acceptInvitation,
    declineInvitation,
  } = useNotificationStore();

  const { showToast } = useUIStore();

  // Initial fetch, window focus listener, and poll unread count every 5 seconds
  useEffect(() => {
    fetchUnreadCount();

    const handleFocus = () => {
      if (!document.hidden) {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchUnreadCount, fetchNotifications, isOpen]);

  // Fetch full list when opening dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAccept = async (invitationId: string, notificationId: string, projectName?: string) => {
    setActionLoadingId(`accept-${notificationId}`);
    const success = await acceptInvitation(invitationId, notificationId);
    setActionLoadingId(null);
    if (success) {
      showToast('success', `Joined ${projectName || 'project'} successfully!`);
      // Re-fetch project list to immediately update sidebar and switcher
      useProjectStore.getState().fetchProjects(true);
    } else {
      showToast('error', 'Failed to accept invitation');
    }
  };

  const handleDecline = async (invitationId: string, notificationId: string) => {
    setActionLoadingId(`decline-${notificationId}`);
    const success = await declineInvitation(invitationId, notificationId);
    setActionLoadingId(null);
    if (success) {
      showToast('info', 'Invitation declined');
    } else {
      showToast('error', 'Failed to decline invitation');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isInvitation = n.type === 'PROJECT_INVITATION' && n.data?.invitationId;
                const isAccepting = actionLoadingId === `accept-${n.id}`;
                const isDeclining = actionLoadingId === `decline-${n.id}`;

                return (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors ${
                      !n.isRead
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'PROJECT_INVITATION' ? (
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'INVITATION_ACCEPTED' ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                        ) : n.type === 'INVITATION_DECLINED' ? (
                          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <UserX className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                          {n.message}
                        </p>

                        {/* Interactive Invitation Actions */}
                        {isInvitation && !n.isRead && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isAccepting || isDeclining}
                              onClick={() =>
                                handleAccept(n.data!.invitationId!, n.id, n.data?.projectName)
                              }
                              leftIcon={
                                isAccepting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-[11px] py-1 px-2.5 h-7"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isAccepting || isDeclining}
                              onClick={() => handleDecline(n.data!.invitationId!, n.id)}
                              leftIcon={
                                isDeclining ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : undefined
                              }
                              className="text-slate-500 hover:text-rose-600 text-[11px] py-1 px-2 h-7"
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {!n.isRead && !isInvitation && (
                          <button
                            type="button"
                            onClick={() => markAsRead(n.id)}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
