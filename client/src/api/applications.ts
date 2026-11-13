import { apiFetch } from './client';
import type { Application, ApplicationInput, ApplicationStatus } from '../types';

export interface ListParams {
  q?: string;
  status?: ApplicationStatus;
  sort?: 'board' | 'newest' | 'oldest' | 'company';
}

export function listApplications(params: ListParams = {}) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.status) search.set('status', params.status);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return apiFetch<Application[]>(`/applications${query ? `?${query}` : ''}`);
}

export const createApplication = (data: ApplicationInput) =>
  apiFetch<Application>('/applications', { method: 'POST', body: data });

export const updateApplication = (id: string, data: Partial<ApplicationInput>) =>
  apiFetch<Application>(`/applications/${id}`, { method: 'PATCH', body: data });

export const deleteApplication = (id: string) =>
  apiFetch<null>(`/applications/${id}`, { method: 'DELETE' });

export const moveApplication = (
  id: string,
  target: { status: ApplicationStatus; position: number }
) => apiFetch<Application>(`/applications/${id}/move`, { method: 'PATCH', body: target });