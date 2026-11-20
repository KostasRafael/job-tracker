import { apiFetch } from './client';
import type { Stats } from '../types';

export const getStats = () => apiFetch<Stats>('/stats');
