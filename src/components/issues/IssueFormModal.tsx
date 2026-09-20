import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useProjectStore } from '../../store/projectStore';
import { useIssueStore } from '../../store/issueStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Issue, IssuePriority, IssueStatus, IssueType } from '../../types';
import { Tag, Plus, Check } from 'lucide-react';

const issueSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(2000).optional(),
  type: z.enum(['TASK', 'BUG', 'FEATURE']),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type IssueFormData = z.infer<typeof issueSchema>;

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIssue?: Issue | null;
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({
  isOpen,
  onClose,
  initialIssue,
}) => {
  const { currentUser } = useAuthStore();
  const { projects, activeProjectId } = useProjectStore();
  const { createIssue, updateIssue, labels, fetchLabels, createLabel } = useIssueStore();
  const { showToast } = useUIStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'TASK',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      assigneeId: '',
      dueDate: '',
    },
  });

  // Fetch labels whenever modal opens for active project
  useEffect(() => {
    if (isOpen && activeProject?.id) {
      fetchLabels(activeProject.id);
    }
  }, [isOpen, activeProject?.id, fetchLabels]);

  // Sync form inputs and selected labels with initialIssue
  useEffect(() => {
    if (initialIssue) {
      reset({
        title: initialIssue.title,
        description: initialIssue.description || '',
        type: initialIssue.type,
        status: initialIssue.status,
        priority: initialIssue.priority,
        assigneeId: initialIssue.assigneeId || '',
        dueDate: initialIssue.dueDate || '',
      });
      setSelectedLabelIds(
        initialIssue.labels && Array.isArray(initialIssue.labels)
          ? initialIssue.labels.map((l) => l.id)
          : [],
      );
    } else {
      reset({
        title: '',
        description: '',
        type: 'TASK',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
      });
      setSelectedLabelIds([]);
    }
    setNewLabelName('');
  }, [initialIssue, reset, isOpen]);

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    );
  };

  const handleAddNewLabel = async () => {
    if (!newLabelName.trim() || !activeProject) return;
    setIsCreatingLabel(true);
    const created = await createLabel(activeProject.id, newLabelName.trim());
    setIsCreatingLabel(false);
    if (created) {
      setSelectedLabelIds((prev) => [...prev, created.id]);
      setNewLabelName('');
      showToast('success', `Label "${created.name}" created`);
    } else {
      showToast('error', 'Failed to create label');
    }
  };

  const onSubmit = async (data: IssueFormData) => {
    if (!currentUser || !activeProject) return;

    const assignee = activeProject.members?.find(
      (m) => m.userId === data.assigneeId,
    )?.user || null;

    if (initialIssue) {
      await updateIssue(initialIssue.id, {
        title: data.title,
        description: data.description,
        type: data.type as IssueType,
        status: data.status as IssueStatus,
        priority: data.priority as IssuePriority,
        assigneeId: assignee?.id || null,
        dueDate: data.dueDate || null,
        labelIds: selectedLabelIds,
      });
      showToast('success', `Issue ${initialIssue.issueKey} updated successfully`);
    } else {
      const selectedLabels = labels.filter((l) => selectedLabelIds.includes(l.id));
      const created = await createIssue({
        projectId: activeProject.id,
        reporter: currentUser,
        title: data.title,
        description: data.description,
        type: data.type as IssueType,
        status: data.status as IssueStatus,
        priority: data.priority as IssuePriority,
        assignee,
        dueDate: data.dueDate || null,
        labels: selectedLabels,
      });
      if (created) {
        showToast('success', `Created issue ${created.issueKey}`);
      } else {
        showToast('error', 'Failed to create issue');
        return;
      }
    }

    onClose();
  };

  const projectLabels = labels.filter((l) => !l.projectId || l.projectId === activeProject?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialIssue ? `Edit Issue: ${initialIssue.issueKey}` : 'Create New Issue'}
      description={
        activeProject
          ? `Project: ${activeProject.name} (${activeProject.key})`
          : undefined
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Summary / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Implement user authentication tokens"
            {...register('title')}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, acceptance criteria, or reproduction steps..."
            {...register('description')}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-y"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
          )}
        </div>

        {/* Row 1: Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Issue Type
            </label>
            <select
              {...register('type')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="TASK">Task (Standard Work)</option>
              <option value="BUG">Bug (Defect / Issue)</option>
              <option value="FEATURE">Feature (New Capability)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Initial Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        {/* Row 2: Priority & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <select
              {...register('assigneeId')}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="">Unassigned</option>
              {(activeProject?.members || []).map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.name || 'Member'} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Labels Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Issue Labels
            </label>
            <span className="text-xs text-slate-400">
              {selectedLabelIds.length} selected
            </span>
          </div>

          {/* Labels Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[38px] p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            {projectLabels.length === 0 ? (
              <span className="text-xs text-slate-400 italic self-center">
                No labels in project yet. Create one below!
              </span>
            ) : (
              projectLabels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                    <span>{label.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Add New Label Inline */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewLabel();
                }
              }}
              placeholder="Add project label (e.g. frontend, backend, bug)..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-brand-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddNewLabel}
              disabled={!newLabelName.trim() || isCreatingLabel}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Label
            </Button>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Due Date
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full sm:w-1/2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {initialIssue ? 'Save Changes' : 'Create Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
