import { apiRequest } from './client';

export const getTasks = (projectId) =>
  apiRequest(`/tasks?project_id=${encodeURIComponent(projectId)}`);

export const createTask = (task) =>
  apiRequest('/tasks', { method: 'POST', body: JSON.stringify(task) });

export const updateTask = (taskId, task) =>
  apiRequest(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(task) });

export const deleteTask = (taskId) =>
  apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
