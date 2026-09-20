import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { ToastContainer } from '../common/ToastContainer';
import { IssueFormModal } from '../issues/IssueFormModal';
import { IssueDetailModal } from '../issues/IssueDetailModal';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useIssueStore } from '../../store/issueStore';
import { useProjectStore } from '../../store/projectStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { currentUser, token, checkAuth } = useAuthStore();
  const {
    isCreateIssueModalOpen,
    closeCreateIssueModal,
    selectedIssueId,
    setSelectedIssueId,
  } = useUIStore();
  const { issues } = useIssueStore();
  const { fetchProjects } = useProjectStore();
  const { fetchUnreadCount } = useNotificationStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setAuthChecked(true));
  }, [checkAuth]);

  // Global background sync & window focus revalidation
  useEffect(() => {
    if (currentUser) {
      fetchProjects(true);
      fetchUnreadCount();

      const handleFocus = () => {
        if (!document.hidden) {
          fetchProjects(true);
          fetchUnreadCount();
        }
      };

      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleFocus);

      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchProjects(true);
          fetchUnreadCount();
        }
      }, 6000);

      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleFocus);
        clearInterval(interval);
      };
    }
  }, [currentUser, fetchProjects, fetchUnreadCount]);

  if (!authChecked && token && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser && !token) {
    return <Navigate to="/login" replace />;
  }

  const editingIssue = issues.find((i) => i.id === editingIssueId);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col">
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
            <Breadcrumbs />
            <div className="flex-1 pb-12">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <IssueFormModal
        isOpen={isCreateIssueModalOpen || Boolean(editingIssueId)}
        onClose={() => {
          closeCreateIssueModal();
          setEditingIssueId(null);
        }}
        initialIssue={editingIssue}
      />

      <IssueDetailModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
        onEdit={() => {
          if (selectedIssueId) {
            setEditingIssueId(selectedIssueId);
            setSelectedIssueId(null);
          }
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
