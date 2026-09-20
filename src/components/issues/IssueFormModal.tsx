import React, { useEffect } from 'react';
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
  const { createIssue, updateIssue } = useIssueStore();
  const { showToast } = useUIStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

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
    }
  }, [initialIssue, reset, isOpen]);

  const onSubmit = (data: IssueFormData) => {
    if (!currentUser || !activeProject) return;

    const assignee = activeProject.members.find(
      (m) => m.userId === data.assigneeId,
    )?.user || null;

    if (initialIssue) {
      updateIssue(
        initialIssue.id,
        {
          title: data.title,
          description: data.description,
          type: data.type as IssueType,
          status: data.status as IssueStatus,
          priority: data.priority as IssuePriority,
          assigneeId: assignee?.id || null,
          assignee,
          dueDate: data.dueDate || null,
        },
        currentUser,
      );
      showToast('success', `Issue ${initialIssue.issueKey} updated successfully`);
    } else {
      const created = createIssue({
        projectId: activeProject.id,
        reporter: currentUser,
        title: data.title,
        description: data.description,
        type: data.type as IssueType,
        status: data.status as IssueStatus,
        priority: data.priority as IssuePriority,
        assignee,
        dueDate: data.dueDate || null,
      });
      showToast('success', `Created issue ${created.issueKey}`);
    }

    onClose();
  };

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
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Summary / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Implement user authentication tokens"
            {...register('title')}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, acceptance criteria, or reproduction steps..."
            {...register('description')}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-y"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
          )}
        </div>

        {/* Row 1: Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Type
            </label>
            <select
              {...register('type')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="TASK">Task (Standard Work)</option>
              <option value="BUG">Bug (Defect / Issue)</option>
              <option value="FEATURE">Feature (New Capability)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Initial Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <select
              {...register('assigneeId')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="">Unassigned</option>
              {activeProject?.members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Due Date
          </label>
          <input
            type="date"
            {...register('dueDate')}
            className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
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
