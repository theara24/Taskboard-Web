import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, User, ProjectMemberRole } from '../types';
import { INITIAL_PROJECTS } from '../mock/initial-data';

interface ProjectState {
  projects: Project[];
  activeProjectId: string;
  setActiveProject: (id: string) => void;
  createProject: (name: string, key: string, description: string, owner: User) => Project;
  updateProject: (id: string, data: Partial<Pick<Project, 'name' | 'description'>>) => void;
  deleteProject: (id: string) => void;
  addMember: (projectId: string, user: User, role?: ProjectMemberRole) => boolean;
  removeMember: (projectId: string, userId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      activeProjectId: INITIAL_PROJECTS[0].id,

      setActiveProject: (id: string) => {
        set({ activeProjectId: id });
      },

      createProject: (name: string, key: string, description: string, owner: User) => {
        const uppercaseKey = key.toUpperCase().trim();
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          name: name.trim(),
          key: uppercaseKey,
          description: description.trim(),
          ownerId: owner.id,
          owner,
          issueCounter: 0,
          members: [
            {
              id: `mem-${Date.now()}`,
              projectId: `proj-${Date.now()}`,
              userId: owner.id,
              role: 'OWNER',
              joinedAt: new Date().toISOString(),
              user: owner,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
          activeProjectId: newProject.id,
        }));

        return newProject;
      },

      updateProject: (id: string, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));
      },

      deleteProject: (id: string) => {
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          return {
            projects: remaining,
            activeProjectId: remaining.length > 0 ? remaining[0].id : '',
          };
        });
      },

      addMember: (projectId: string, user: User, role: ProjectMemberRole = 'MEMBER') => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return false;

        const alreadyMember = project.members.some((m) => m.userId === user.id);
        if (alreadyMember) return false;

        const newMember = {
          id: `mem-${Date.now()}`,
          projectId,
          userId: user.id,
          role,
          joinedAt: new Date().toISOString(),
          user,
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  members: [...p.members, newMember],
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
        }));

        return true;
      },

      removeMember: (projectId: string, userId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            if (p.ownerId === userId) return p; // Cannot remove project owner
            return {
              ...p,
              members: p.members.filter((m) => m.userId !== userId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'taskboard_projects_v1',
    },
  ),
);
