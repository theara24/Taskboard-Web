import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { UserAvatar } from '../common/UserAvatar';
import { Button } from '../common/Button';
import {
  Kanban,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  UserCheck,
  FolderKanban,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, users, switchUser, logout } = useAuthStore();
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const { searchQuery, setSearchQuery, openCreateIssueModal } = useUIStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    setIsProjectMenuOpen(false);
    navigate(`/projects/${projectId}/board`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Left branding and project switcher */}
      <div className="flex items-center gap-3 md:gap-6">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Kanban className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline-block">
            Task<span className="text-brand-600">Board</span>
          </span>
        </Link>

        {/* Project Selector Dropdown */}
        {activeProject && (
          <div className="relative">
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span className="max-w-[140px] md:max-w-[180px] truncate">
                {activeProject.name}
              </span>
              <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                {activeProject.key}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProjectMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsProjectMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Project
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-800 truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {p.key}
                        </div>
                      </div>
                      {p.id === activeProjectId && (
                        <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <Link
                      to="/projects"
                      onClick={() => setIsProjectMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      View All Projects
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Global Search & Quick Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Global Search */}
        <div className="relative hidden md:block w-48 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search issues (title, key, desc)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Create Issue Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={openCreateIssueModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-brand-500/25"
        >
          <span className="hidden sm:inline">Create Issue</span>
          <span className="sm:hidden">New</span>
        </Button>

        {/* User Profile & Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <UserAvatar user={currentUser} size="sm" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                    {currentUser?.role}
                  </span>
                </div>

                <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <UserAvatar user={u} size="xs" />
                      <span className="truncate">{u.name}</span>
                    </div>
                    {u.id === currentUser?.id && (
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      navigate('/login');
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
