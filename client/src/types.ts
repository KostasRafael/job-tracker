export type ApplicationStatus = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected';

export const STATUSES: ApplicationStatus[] = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
];

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Application {
  _id: string;
  company: string;
  role: string;
  url?: string;
  location?: string;
  salary?: number;
  status: ApplicationStatus;
  notes?: string;
  appliedAt?: string; // a date as text, such as "2026-11-05T00:00:00.000Z"
  position: number;
  createdAt: string;
}

// the data the form sends when creating or editing
export interface ApplicationInput {
  company: string;
  role: string;
  url?: string;
  location?: string;
  salary?: number;
  status?: ApplicationStatus;
  notes?: string;
  appliedAt?: string;
}