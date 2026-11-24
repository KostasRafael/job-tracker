import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
  // clicking anywhere on the card except Edit; left out on the drag overlay copy
  onOpen?: (application: Application) => void;
}

type CardViewProps = ApplicationCardProps & HTMLAttributes<HTMLElement>;

// The card's markup only, with no drag logic. The board card below wraps it
// with useSortable, and the DragOverlay renders it directly as the floating copy.
export const ApplicationCardView = forwardRef<HTMLElement, CardViewProps>(
  function ApplicationCardView({ application, onEdit, onOpen, className, ...rest }, ref) {
    const { company, role, appliedAt, salary } = application;
    const classes = ['app-card', onOpen && 'app-card-clickable', className].filter(Boolean);

    return (
      <article
        ref={ref}
        className={classes.join(' ')}
        onClick={onOpen ? () => onOpen(application) : undefined}
        {...rest}
      >
        <div className="app-card-header">
          <h3 className="app-card-company">
            {onOpen ? (
              // Mouse users click anywhere on the card; this button gives keyboard
              // and screen reader users the same action. It needs no handler of
              // its own: its click (also fired by Enter/Space) bubbles to the card.
              <button
                type="button"
                className="app-card-open"
                aria-label={`View details for ${role} at ${company}`}
              >
                {company}
              </button>
            ) : (
              company
            )}
          </h3>
          <button
            type="button"
            className="button-secondary button-small"
            onClick={(e) => {
              e.stopPropagation(); // Edit only, don't also open the details
              onEdit(application);
            }}
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

export default function ApplicationCard({
  application,
  onEdit,
  onOpen,
  dragDisabled = false,
}: ApplicationCardProps & { dragDisabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application._id,
    disabled: dragDisabled,
  });

  // The card itself is also the drag activator. Then the keyboard sensor only
  // starts a drag when Space/Enter is pressed on the card, not when it bubbles
  // up from the Edit or company buttons inside it (those keep working normally).
  function setRefs(node: HTMLElement | null) {
    setNodeRef(node);
    setActivatorNodeRef(node);
  }

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // the DragOverlay shows the moving copy; this one stays as a faded placeholder
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <ApplicationCardView
      ref={setRefs}
      application={application}
      onEdit={onEdit}
      onOpen={onOpen}
      style={style}
      // while disabled, leave out the drag handlers (and the role="button"
      // attributes), so the card is just a plain card
      {...(dragDisabled ? {} : { ...attributes, ...listeners })}
    />
  );
}
