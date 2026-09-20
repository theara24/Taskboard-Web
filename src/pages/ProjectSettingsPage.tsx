import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Save, Trash2, UserPlus, Shield, UserMinus, Mail, Clock } from 'lucide-react';

import { userApi, invitationApi } from '../api';
import { ProjectInvitation } from '../types';

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, removeMember } = useProjectStore();
  const { currentUser } = useAuthStore();
  const { showToast } = useUIStore();

  const project = projects.find((p) => p.id === projectId);

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [inviteInput, setInviteInput] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<ProjectInvitation[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const isOwner = project.ownerId === currentUser?.id || currentUser?.role === 'ADMIN';

  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  React.useEffect(() => {
    userApi.getAll().then((users) => setSystemUsers(users)).catch(() => {});
  }, []);

  // Available users to add (not yet a member)
  const nonMembers = systemUsers.filter((u) => !project.members?.some((m) => m.userId === u.id));

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
    });
    showToast('success', 'Project details saved');
  };

  const fetchInvitations = React.useCallback(() => {
    if (project?.id && isOwner) {
      invitationApi.listByProject(project.id).then(setPendingInvitations).catch(() => {});
    }
  }, [project?.id, isOwner]);

  React.useEffect(() => {
    fetchInvitations();

    const handleFocus = () => {
      if (!document.hidden) {
        fetchInvitations();
        useProjectStore.getState().fetchProjects(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchInvitations();
        useProjectStore.getState().fetchProjects(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      clearInterval(interval);
    };
  }, [fetchInvitations]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setIsInviting(true);
    try {
      const inv = await invitationApi.invite(project.id, inviteInput.trim(), 'MEMBER');
      showToast('success', `Invitation sent to ${inv.inviteeEmail}`);
      setInviteInput('');
      fetchInvitations();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await invitationApi.revoke(project.id, invitationId);
      showToast('info', 'Invitation revoked');
      setPendingInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err: any) {
      showToast('error', err.message || 'Failed to revoke invitation');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    await removeMember(project.id, userId);
    showToast('info', `Removed ${userName} from project`);
  };

  const handleDeleteProject = async () => {
    await deleteProject(project.id);
    showToast('success', `Project "${project.name}" deleted`);
    setIsConfirmDeleteOpen(false);
    navigate('/projects');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            {project.key}
          </span>
          <span className="text-xs text-slate-400">• Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Project Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure metadata, members, and permissions
        </p>
      </div>

      {/* General Settings Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          General Information
        </h3>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Project Key
              </label>
              <input
                type="text"
                disabled
                value={project.key}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-mono font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Key prefix cannot be modified after project creation.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Project Members Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Project Members ({(project.members || []).length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Members can view, create, and be assigned issues within this project.
          </p>
        </div>

        {/* Add Member Form */}
        {isOwner && (
          <form onSubmit={handleInviteMember} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Invite Team Member
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  list="registered-users-list"
                  placeholder="Enter Google email (e.g. name@gmail.com) or username..."
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <datalist id="registered-users-list">
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </datalist>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!inviteInput.trim() || isInviting}
                  isLoading={isInviting}
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Send Invite
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                The invited user will receive a notification in their dashboard with an Accept button to join this project.
              </p>
            </div>
          </form>
        )}

        {/* Member List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(project.members || []).map((member) => (
            <div
              key={member.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={member.user} size="sm" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {member.user.name}
                    {member.userId === project.ownerId && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded">
                        <Shield className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{member.user.email}</div>
                </div>
              </div>

              {isOwner && member.userId !== project.ownerId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId, member.user.name)}
                  className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  leftIcon={<UserMinus className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Pending Invitations */}
        {isOwner && pendingInvitations.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Invitations ({pendingInvitations.length})</span>
            </h4>
            <div className="space-y-2">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {inv.inviteeEmail}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                          PENDING
                        </span>
                        <span>Role: {inv.role}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeInvitation(inv.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-rose-50/60 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-3">
          <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">Danger Zone</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
            Deleting this project permanently wipes all issues, comments, labels, and
            activity history associated with {project.key}. This action cannot be undone.
          </p>
          <div className="pt-2">
            <Button
              variant="danger"
              onClick={() => setIsConfirmDeleteOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Project
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${project.name}"? All associated issues and boards will be lost.`}
        confirmText="Yes, Delete Project"
        isDestructive
      />
    </div>
  );
};
