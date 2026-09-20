import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { useIssueStore } from '../../store/issueStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { UserAvatar } from '../common/UserAvatar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  FolderKanban,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const navigate = useNavigate();
  const { issues } = useIssueStore();
  const { deleteProject, setActiveProject } = useProjectStore();
  const { showToast } = useUIStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const totalCount = projectIssues.length;
  const doneCount = projectIssues.filter((i) => i.status === 'DONE').length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const handleOpen = () => {
    setActiveProject(project.id);
    navigate(`/projects/${project.id}/board`);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    showToast('success', `Project "${project.name}" deleted`);
    setIsConfirmDeleteOpen(false);
  };

  return (
    <>
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group">
        {/* Header: Icon, Key, Title, Menu */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm shadow-xs">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {project.key}
                </span>
                <h3
                  onClick={handleOpen}
                  className="font-bold text-slate-900 mt-1 hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                >
                  {project.name}
                </h3>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1 text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(project);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Project
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsConfirmDeleteOpen(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed mb-4">
            {project.description || 'No description provided.'}
          </p>

          {/* Progress Bar */}
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Progress
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer: Issues count, Members, Open Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              <strong className="text-slate-800">{totalCount}</strong> issues
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.members.length}
            </span>
          </div>

          <button
            onClick={handleOpen}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
          >
            Open Board
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}" and all of its associated issues, labels, and activities?`}
        confirmText="Delete Project"
        isDestructive
      />
    </>
  );
};
