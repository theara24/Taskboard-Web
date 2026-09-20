import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Project } from '../../types';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(80),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(8, 'Project key max 8 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Project key must be alphanumeric (e.g. WEB, MOB)')
    .transform((v) => v.toUpperCase()),
  description: z.string().max(500).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProject?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  initialProject,
}) => {
  const { currentUser } = useAuthStore();
  const { createProject, updateProject, projects } = useProjectStore();
  const { showToast } = useUIStore();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialProject) {
      reset({
        name: initialProject.name,
        key: initialProject.key,
        description: initialProject.description || '',
      });
    } else {
      reset({
        name: '',
        key: '',
        description: '',
      });
    }
  }, [initialProject, reset, isOpen]);

  const onSubmit = (data: ProjectFormData) => {
    if (!currentUser) return;

    if (initialProject) {
      updateProject(initialProject.id, {
        name: data.name,
        description: data.description,
      });
      showToast('success', `Project "${data.name}" updated successfully`);
    } else {
      const existingKey = projects.some(
        (p) => p.key.toUpperCase() === data.key.toUpperCase(),
      );
      if (existingKey) {
        setError('key', { message: `Project key "${data.key}" already exists` });
        return;
      }

      const created = createProject(
        data.name,
        data.key,
        data.description || '',
        currentUser,
      );
      showToast('success', `Project "${created.name}" created!`);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProject ? 'Edit Project Details' : 'Create New Project'}
      description="Projects organize issues, roadmaps, and team members."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Mobile Banking App"
            {...register('name')}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

        {/* Project Key */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Key <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={Boolean(initialProject)}
            placeholder="e.g. MOB"
            {...register('key')}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase font-mono font-bold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Used as prefix for issue keys (e.g. {initialProject?.key || 'MOB'}-1, {initialProject?.key || 'MOB'}-2). Cannot be changed later.
          </p>
          {errors.key && (
            <p className="mt-1 text-xs text-rose-500">{errors.key.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief purpose of this project..."
            {...register('description')}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {initialProject ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
