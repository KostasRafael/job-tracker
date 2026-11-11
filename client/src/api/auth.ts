import { apiFetch } from './client';
import type { User } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = (data: RegisterData) =>
  apiFetch<User>('/auth/register', { method: 'POST', body: data });

export const login = (data: LoginData) =>
  apiFetch<User>('/auth/login', { method: 'POST', body: data });

export const logout = () => apiFetch<null>('/auth/logout', { method: 'POST' });

export const getMe = () => apiFetch<User>('/auth/me');