import { apiRequest } from './client';

export const getProjects = () => apiRequest('/projects');
export const getProjectUsers = (projectId) => apiRequest(`/projects/${projectId}/users`);
export const addProjectUser = (projectId, data) =>
  apiRequest(`/projects/${projectId}/users`, { method: 'POST', body: JSON.stringify(data) });
export const removeProjectUser = (projectId, userId) =>
  apiRequest(`/projects/${projectId}/users/${userId}`, { method: 'DELETE' });
export const getWorkload = (projectId) => apiRequest(`/projects/${projectId}/workload`);
