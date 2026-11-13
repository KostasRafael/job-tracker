import type { ApplicationStatus } from '../types';

export const STATUS_META: Record<ApplicationStatus, { label: string; color: string }> = {
  wishlist: { label: 'Wishlist', color: '#64748b' },
  applied: { label: 'Applied', color: '#2563eb' },
  interview: { label: 'Interview', color: '#9333ea' },
  offer: { label: 'Offer', color: '#16a34a' },
  rejected: { label: 'Rejected', color: '#dc2626' },
};