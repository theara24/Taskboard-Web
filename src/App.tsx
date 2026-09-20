import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { IssuesListPage } from './pages/IssuesListPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminSupportPage } from './pages/AdminSupportPage';
import { UserSupportPage } from './pages/UserSupportPage';
import { useAuthStore } from './store/authStore';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuthStore();
  if (currentUser && currentUser.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected Application Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId/board" element={<KanbanBoardPage />} />
          <Route path="/projects/:projectId/issues" element={<IssuesListPage />} />
          <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<UserSupportPage />} />

          {/* Platform Administrator Routes */}
          <Route
            path="/admin"
            element={
              <AdminRouteGuard>
                <AdminDashboardPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRouteGuard>
                <AdminUsersPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <AdminRouteGuard>
                <AdminProjectsPage />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AdminRouteGuard>
                <AdminSupportPage />
              </AdminRouteGuard>
            }
          />
        </Route>

        {/* Fallback 404 Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
