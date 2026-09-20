import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const { projects } = useProjectStore();

  const activeProject = projects.find((p) => p.id === projectId);
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium py-3">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium py-3 overflow-x-auto">
      <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((segment, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        let displayTitle = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (segment === projectId && activeProject) {
          displayTitle = activeProject.name;
        } else if (segment === 'board') {
          displayTitle = 'Kanban Board';
        } else if (segment === 'issues') {
          displayTitle = 'Issues';
        } else if (segment === 'settings') {
          displayTitle = 'Settings';
        }

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px]">
                {displayTitle}
              </span>
            ) : (
              <Link to={to} className="hover:text-slate-900 dark:hover:text-white truncate max-w-[150px]">
                {displayTitle}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
