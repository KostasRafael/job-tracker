import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import ApplicationCard from '../components/ApplicationCard';
import ApplicationFormModal from '../components/ApplicationFormModal';
import { useApplications } from '../hooks/useApplications';
import { STATUSES, type Application, type ApplicationStatus } from '../types';
import { STATUS_META } from '../utils/statuses';

const SKELETON_CARDS = 2;

// One column per status, in the order of STATUSES, coloured from STATUS_META.
function BoardColumn({
  status,
  count,
  children,
}: {
  status: ApplicationStatus;
  count?: number;
  children: ReactNode;
}) {
  const { label, color } = STATUS_META[status];
  return (
    <section
      className="board-column"
      aria-labelledby={`column-${status}`}
      style={{ '--column-color': color } as CSSProperties}
    >
      <h2 id={`column-${status}`} className="board-column-title">
        <span className="board-column-name">
          <span className="board-column-dot" aria-hidden="true" />
          {label}
        </span>
        {count !== undefined && (
          <span className="board-column-count">
            {count}
            {/* screen readers hear "Interview, 5 applications" instead of just "5" */}
            <span className="visually-hidden"> applications</span>
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

export default function BoardPage() {
  const { applications, loading, error, refetch } = useApplications();
  // Which modal is open: adding a new one, or editing one (null means none).
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const addButton = (
    <button type="button" className="button-primary" onClick={() => setCreating(true)}>
      Add application
    </button>
  );

  // `{} as Record<...>` starts empty and promises TypeScript that every status
  // gets a list; the loop over STATUSES keeps that promise. So columns.interview
  // is typed as Application[] with no undefined check needed.
  // useMemo: only recalculated when `applications` changes, not on every render.
  const columns = useMemo(() => {
    const grouped = {} as Record<ApplicationStatus, Application[]>;
    for (const status of STATUSES) {
      grouped[status] = applications
        .filter((a) => a.status === status)
        .sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [applications]);

  let content: ReactNode;

  if (loading) {
    content = (
      <>
        <p className="visually-hidden" role="status">
          Loading applications...
        </p>
        <div className="board" aria-busy="true">
          {STATUSES.map((status) => (
            <BoardColumn key={status} status={status}>
              <ul className="board-cards" aria-hidden="true">
                {Array.from({ length: SKELETON_CARDS }, (_, i) => (
                  <li key={i} className="app-card">
                    <span className="skeleton" />
                    <span className="skeleton skeleton-short" />
                  </li>
                ))}
              </ul>
            </BoardColumn>
          ))}
        </div>
      </>
    );
  } else if (error) {
    content = (
      <div className="state-box state-error" role="alert">
        <p>Could not load your applications: {error}</p>
        <button type="button" className="state-button" onClick={() => void refetch()}>
          Try again
        </button>
      </div>
    );
  } else if (applications.length === 0) {
    content = (
      <div className="state-box">
        <p>No applications yet. Add your first one to get started.</p>
        {addButton}
      </div>
    );
  } else {
    content = (
      <div className="board">
        {STATUSES.map((status) => (
          <BoardColumn key={status} status={status} count={columns[status].length}>
            {columns[status].length === 0 ? (
              <p className="board-column-empty">No applications</p>
            ) : (
              <ul className="board-cards">
                {columns[status].map((app) => (
                  <li key={app._id}>
                    <ApplicationCard application={app} onEdit={setEditing} />
                  </li>
                ))}
              </ul>
            )}
          </BoardColumn>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Board</h1>
        {/* the empty state has its own button, so don't show two */}
        {!loading && !error && applications.length > 0 && addButton}
      </div>
      {content}

      <ApplicationFormModal
        open={creating || editing !== null}
        application={editing}
        onClose={closeForm}
        onSaved={refetch}
      />
    </>
  );
}
