import { create } from 'zustand';
import { ProjectSummary, ProjectInfo, UpdateRecord } from '../types';

interface ProjectStore {
  projects: ProjectSummary[];
  selectedProject: ProjectInfo | null;
  updateRecords: UpdateRecord[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: ProjectSummary[]) => void;
  setSelectedProject: (project: ProjectInfo | null) => void;
  setUpdateRecords: (records: UpdateRecord[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProject: (project: ProjectSummary) => void;
  updateProject: (projectId: number, updates: Partial<ProjectSummary>) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProject: null,
  updateRecords: [],
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  
  setSelectedProject: (project) => set({ selectedProject: project }),
  
  setUpdateRecords: (records) => set({ updateRecords: records }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addProject: (project) => {
    const { projects } = get();
    set({ projects: [...projects, project] });
  },
  
  updateProject: (projectId, updates) => {
    const { projects } = get();
    const updatedProjects = projects.map(project =>
      project.projectId === projectId ? { ...project, ...updates } : project
    );
    set({ projects: updatedProjects });
  },
  
  clearError: () => set({ error: null }),
}));
