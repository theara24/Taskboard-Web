import React, { useState } from 'react';
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

export const AppLayout: React.FC = () => {
  const { currentUser } = useAuthStore();
  const {
    isCreateIssueModalOpen,
    closeCreateIssueModal,
    selectedIssueId,
    setSelectedIssueId,
  } = useUIStore();
  const { issues } = useIssueStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);
  const editingIssue = issues.find((i) => i.id === editingIssueId);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden font-sans">
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
