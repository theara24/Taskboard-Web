import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useIssueStore } from '../../store/issueStore';
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  ListTodo,
  Settings,
  User,
  Users,
  Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const { projects, activeProjectId } = useProjectStore();
  const { issues } = useIssueStore();

  const currentProjectId = urlProjectId || activeProjectId;
  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const projectIssues = issues.filter((i) => i.projectId === activeProject?.id);
  const openIssuesCount = projectIssues.filter((i) => i.status !== 'DONE').length;

  const navItems = [
    {
      label: 'Global',
      items: [
        {
          name: 'Dashboard',
          to: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Projects',
          to: '/projects',
          icon: FolderKanban,
          badge: projects.length,
        },
      ],
    },
    {
      label: activeProject ? `Project (${activeProject.key})` : 'Project',
      items: activeProject
        ? [
            {
              name: 'Kanban Board',
              to: `/projects/${activeProject.id}/board`,
              icon: Kanban,
            },
            {
              name: 'All Issues',
              to: `/projects/${activeProject.id}/issues`,
              icon: ListTodo,
              badge: openIssuesCount,
            },
            {
              name: 'Project Settings',
              to: `/projects/${activeProject.id}/settings`,
              icon: Settings,
            },
          ]
        : [],
    },
    {
      label: 'Personal',
      items: [
        {
          name: 'My Profile',
          to: '/profile',
          icon: User,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Active Project Highlight Card */}
          {activeProject && (
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Project
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {activeProject.name}
              </h4>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                  {activeProject.key}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {activeProject.members.length} members
                </span>
              </div>
            </div>
          )}

          {/* Nav Groups */}
          <nav className="space-y-6">
            {navItems.map((group) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group',
                            isActive
                              ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
          TaskBoard v1.0.0 • Academic Edition
        </div>
      </aside>
    </>
  );
};
