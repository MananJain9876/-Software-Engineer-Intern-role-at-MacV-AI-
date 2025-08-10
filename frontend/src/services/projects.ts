import api from './api';
import type { Task } from './tasks';

export interface Project {
  id: number;
  name: string;
  description: string;
  owner_id: number;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface ProjectCreate {
  name: string;
  description: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects/');
    return response.data;
  },
  
  getProject: async (id: number): Promise<ProjectWithTasks> => {
    const response = await api.get<ProjectWithTasks>(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (project: ProjectCreate): Promise<Project> => {
    const response = await api.post<Project>('/projects/', project);
    return response.data;
  },
  
  updateProject: async (id: number, project: ProjectUpdate): Promise<Project> => {
    const response = await api.patch<Project>(`/projects/${id}`, project);
    return response.data;
  },
  
  deleteProject: async (id: number): Promise<Project> => {
    const response = await api.delete<Project>(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;