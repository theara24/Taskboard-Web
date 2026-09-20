import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  FolderKanban,
  Search,
  Shield,
  Trash2,
  Users,
  ListTodo,
  Clock,
  Loader2,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const {
    projects,
    projectsPagination,
    fetchProjects,
    selectedProjectDetail,
    fetchProjectDetail,
    deleteProject,
    isLoading,
  } = useAdminStore();
  const { showToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string; key: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects({ search: search || undefined });

    const handleFocus = () => {
      if (!document.hidden) {
        fetchProjects({ search: search || undefined }, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchProjects({ search: search || undefined }, true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchProjects, search]);

  const handleOpenDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
    fetchProjectDetail(projectId);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const success = await deleteProject(projectToDelete.id);
    setIsDeleting(false);

    if (success) {
      showToast('success', `Project "${projectToDelete.name}" deleted successfully`);
      setProjectToDelete(null);
      if (selectedProjectId === projectToDelete.id) {
        setSelectedProjectId(null);
      }
    } else {
      showToast('error', 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Platform Admin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Platform Project Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administrate and inspect all organizational workspaces created on TaskBoard
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, description..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Projects: {projectsPagination.total}
        </div>
      </div>

      {/* Projects Table */}
      {isLoading && projects.length === 0 ? (
        <div className="flex justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="There are currently no platform projects matching your query."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Key</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Total Issues</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {projects.map((p: any) => (
                <tr
                  key={p.id}
                  onClick={() => handleOpenDetail(p.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {p.key}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={p.owner} className="w-6 h-6" />
                      <div>
                        <div className="font-medium text-xs text-slate-900 dark:text-white">{p.owner.name}</div>
                        <div className="text-[11px] text-slate-400">{p.owner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {p._count?.members ?? 0} members
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {p._count?.issues ?? 0} issues
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(p.id)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProjectToDelete({ id: p.id, name: p.name, key: p.key })}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProjectDetail && (
        <Modal
          isOpen={Boolean(selectedProjectId)}
          onClose={() => setSelectedProjectId(null)}
          title={`Project Inspection: ${selectedProjectDetail.name} (${selectedProjectDetail.key})`}
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  KEY: {selectedProjectDetail.key}
                </span>
                <span className="text-xs text-slate-400">
                  Created {new Date(selectedProjectDetail.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProjectDetail.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedProjectDetail.description || 'No project description provided.'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold">Project Owner:</span>
                <UserAvatar user={selectedProjectDetail.owner} className="w-5 h-5" />
                <span>{selectedProjectDetail.owner.name} ({selectedProjectDetail.owner.email})</span>
              </div>
            </div>

            {/* Issue Status Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Issue Status Breakdown
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <div className="text-slate-500">Backlog</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedProjectDetail.issueStatusCounts?.BACKLOG ?? 0}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  <div>To Do</div>
                  <div className="text-base font-bold">
                    {selectedProjectDetail.issueStatusCounts?.TODO ?? 0}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  <div>In Progress</div>
                  <div className="text-base font-bold">
                    {selectedProjectDetail.issueStatusCounts?.IN_PROGRESS ?? 0}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <div>Done</div>
                  <div className="text-base font-bold">
                    {selectedProjectDetail.issueStatusCounts?.DONE ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Project Members ({selectedProjectDetail.members?.length ?? 0})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedProjectDetail.members?.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar user={m.user} className="w-6 h-6" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{m.user.name}</span>
                        <span className="text-slate-400 ml-1">({m.user.email})</span>
                      </div>
                    </div>
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setProjectToDelete({ id: selectedProjectDetail.id, name: selectedProjectDetail.name, key: selectedProjectDetail.key })}
              >
                Delete Project
              </Button>
              <Button variant="ghost" onClick={() => setSelectedProjectId(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {projectToDelete && (
        <ConfirmDialog
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={`Delete Project "${projectToDelete.name}" (${projectToDelete.key})`}
          message="Are you sure you want to delete this project? This will permanently remove the project and all related issues, comments, labels, and invitations."
          confirmText="Delete Project Permanently"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
