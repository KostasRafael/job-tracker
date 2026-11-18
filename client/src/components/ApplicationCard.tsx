import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
}

type CardViewProps = ApplicationCardProps & HTMLAttributes<HTMLElement>;

// The card's markup only, with no drag logic. The board card below wraps it
// with useSortable, and the DragOverlay renders it directly as the floating copy.
export const ApplicationCardView = forwardRef<HTMLElement, CardViewProps>(
  function ApplicationCardView({ application, onEdit, className, ...rest }, ref) {
    const { company, role, appliedAt, salary } = application;

    return (
      <article ref={ref} className={`app-card ${className ?? ''}`.trim()} {...rest}>
        <div className="app-card-header">
          <h3 className="app-card-company">{company}</h3>
          <button
            type="button"
            className="button-secondary button-small"
            onClick={() => onEdit(application)}
            aria-label={`Edit ${role} at ${company}`}
          >
            Edit
          </button>
        </div>
        <p className="app-card-role">{role}</p>
        <dl className="app-card-details">
          <div>
            <dt>Applied</dt>
            <dd>{appliedAt ? new Date(appliedAt).toLocaleDateString() : 'Not yet'}</dd>
          </div>
          {/* salary 0 is falsy, so compare against undefined */}
          {salary !== undefined && (
            <div>
              <dt>Salary</dt>
              <dd>{salary.toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </article>
    );
  }
);

export default function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application._id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // the DragOverlay shows the moving copy; this one stays as a faded placeholder
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <ApplicationCardView
      ref={setNodeRef}
      application={application}
      onEdit={onEdit}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
