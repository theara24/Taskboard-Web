import { create } from 'zustand';
import { Project, ProjectMemberRole } from '../types';
import { projectApi } from '../api';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;
  isLoading: boolean;
  error: string | null;

  fetchProjects: (silent?: boolean) => Promise<void>;
  setActiveProject: (id: string) => void;
  createProject: (name: string, key: string, description: string) => Promise<Project | null>;
  updateProject: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string, role?: ProjectMemberRole) => Promise<boolean>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: '',
  isLoading: false,
  error: null,

  fetchProjects: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.getAll();
      const currentActive = get().activeProjectId;
      const validActive = projects.some((p) => p.id === currentActive)
        ? currentActive
        : projects[0]?.id || '';

      set({
        projects,
        activeProjectId: validActive,
        isLoading: false,
      });
    } catch (err: any) {
      if (!silent) {
        set({
          error: err.message || 'Failed to fetch projects',
          isLoading: false,
        });
      }
    }
  },

  setActiveProject: (id: string) => {
    set({ activeProjectId: id });
  },

  createProject: async (name: string, key: string, description: string) => {
    set({ isLoading: true, error: null });
    try {
      const newProj = await projectApi.create({
        name: name.trim(),
        key: key.toUpperCase().trim(),
        description: description.trim(),
      });

      // Reload all projects to get full member relations
      const all = await projectApi.getAll();
      set({
        projects: all,
        activeProjectId: newProj.id,
        isLoading: false,
      });

      return newProj;
    } catch (err: any) {
      set({
        error: err.message || 'Failed to create project',
        isLoading: false,
      });
      return null;
    }
  },

  updateProject: async (id: string, data) => {
    try {
      const updated = await projectApi.update(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updated } : p)),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update project' });
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectApi.delete(id);
      set((state) => {
        const remaining = state.projects.filter((p) => p.id !== id);
        return {
          projects: remaining,
          activeProjectId: remaining[0]?.id || '',
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete project' });
    }
  },

  addMember: async (projectId: string, userId: string, role: ProjectMemberRole = 'MEMBER') => {
    try {
      await projectApi.addMember(projectId, userId, role);
      // Reload projects to get refreshed members list
      const projects = await projectApi.getAll();
      set({ projects });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add member' });
      return false;
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    try {
      await projectApi.removeMember(projectId, userId);
      const projects = await projectApi.getAll();
      set({ projects });
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove member' });
    }
  },
}));
