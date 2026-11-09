import { z } from 'zod';
import { STATUSES } from '../models/Application.js';

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(100),
  url: z.string().trim().url().or(z.literal('')).optional(),
  location: z.string().trim().optional(),
  salary: z.number().int().nonnegative().optional(),
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(2000).optional(),
  appliedAt: z.coerce.date().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const moveSchema = z.object({
  status: z.enum(STATUSES),
  position: z.number().int().min(0),
});

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(['board', 'newest', 'oldest', 'company']).default('board'),
});
