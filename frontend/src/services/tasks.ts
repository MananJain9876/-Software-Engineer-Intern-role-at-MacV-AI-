import api from './api';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string | null;
  project_id: number;
  assigned_user_id: number | null;
}

export interface TaskCreate {
  title: string;
  description: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string | null;
  project_id: number;
  assigned_user_id?: number | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string | null;
  project_id?: number;
  assigned_user_id?: number | null;
}

export interface TaskFilter {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  project_id?: number;
  sort?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const taskService = {
  getTasks: async (filter?: TaskFilter): Promise<Task[]> => {
    const params = filter ? { ...filter } : {};
    const response = await api.get<Task[]>('/tasks/', { params });
    return response.data;
  },
  
  getTask: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (task: TaskCreate): Promise<Task> => {
    const response = await api.post<Task>('/tasks/', task);
    return response.data;
  },
  
  updateTask: async (id: number, task: TaskUpdate): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}`, task);
    return response.data;
  },
  
  deleteTask: async (id: number): Promise<Task> => {
    const response = await api.delete<Task>(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;