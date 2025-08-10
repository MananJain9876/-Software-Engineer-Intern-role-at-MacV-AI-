export { default as api } from './api';
export { default as authService } from './auth';
export { default as projectService } from './projects';
export { default as taskService } from './tasks';

// Re-export types
export type { LoginCredentials, AuthResponse, User } from './auth';
export type { Project, ProjectWithTasks, ProjectCreate, ProjectUpdate } from './projects';
export type { Task, TaskCreate, TaskUpdate, TaskFilter } from './tasks';