import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Save, Trash2, UserPlus, Shield, UserMinus } from 'lucide-react';

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, addMember, removeMember } = useProjectStore();
  const { users, currentUser } = useAuthStore();
  const { showToast } = useUIStore();

  const project = projects.find((p) => p.id === projectId);

  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const isOwner = project.ownerId === currentUser?.id || currentUser?.role === 'ADMIN';

  // Available users to add (not yet a member)
  const nonMembers = users.filter((u) => !project.members.some((m) => m.userId === u.id));

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
    });
    showToast('success', 'Project details saved');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const userToAdd = users.find((u) => u.id === selectedUserId);
    if (!userToAdd) return;

    const success = addMember(project.id, userToAdd, 'MEMBER');
    if (success) {
      showToast('success', `Added ${userToAdd.name} to project`);
      setSelectedUserId('');
    } else {
      showToast('error', 'User is already a member');
    }
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    removeMember(project.id, userId);
    showToast('info', `Removed ${userName} from project`);
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    showToast('success', `Project "${project.name}" deleted`);
    setIsConfirmDeleteOpen(false);
    navigate('/projects');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            {project.key}
          </span>
          <span className="text-xs text-slate-400">• Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Project Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure metadata, members, and permissions
        </p>
      </div>

      {/* General Settings Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          General Information
        </h3>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Key
              </label>
              <input
                type="text"
                disabled
                value={project.key}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-mono font-bold bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400">
                Key prefix cannot be modified after project creation.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Project Members ({project.members.length})
          </h3>
          <p className="text-xs text-slate-500">
            Members can view, create, and be assigned issues within this project.
          </p>
        </div>

        {/* Add Member Form */}
        {isOwner && nonMembers.length > 0 && (
          <form onSubmit={handleAddMember} className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Invite Team Member
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              >
                <option value="">Select a user...</option>
                {nonMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedUserId}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Member
            </Button>
          </form>
        )}

        {/* Member List */}
        <div className="divide-y divide-slate-100">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={member.user} size="sm" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    {member.user.name}
                    {member.userId === project.ownerId && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">
                        <Shield className="w-3 h-3 text-brand-600" />
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{member.user.email}</div>
                </div>
              </div>

              {isOwner && member.userId !== project.ownerId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId, member.user.name)}
                  className="text-rose-600 hover:bg-rose-50"
                  leftIcon={<UserMinus className="w-3.5 h-3.5" />}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="bg-rose-50/60 p-6 rounded-2xl border border-rose-200 space-y-3">
          <h3 className="text-base font-bold text-rose-800">Danger Zone</h3>
          <p className="text-xs text-rose-600 leading-relaxed">
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
