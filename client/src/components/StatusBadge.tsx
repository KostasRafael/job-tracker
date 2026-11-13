import type { CSSProperties } from 'react';
import type { ApplicationStatus } from '../types';
import { STATUS_META } from '../utils/statuses';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = STATUS_META[status];

  // The colour goes on the dot, border and tint; the text stays in the normal
  // heading colour so it is readable for every status, in light and dark mode.
  return (
    <span className="status-badge" style={{ '--badge-color': color } as CSSProperties}>
      <span className="status-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
