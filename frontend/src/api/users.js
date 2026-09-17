import { apiRequest } from './client';

export const getUsers = () => apiRequest('/users');
