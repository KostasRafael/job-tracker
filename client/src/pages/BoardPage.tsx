import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { moveApplication } from '../api/applications';
import ApplicationCard, { ApplicationCardView } from '../components/ApplicationCard';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import ApplicationFormModal from '../components/ApplicationFormModal';
import DeleteApplicationModal from '../components/DeleteApplicationModal';
import SearchBox from '../components/SearchBox';
import { useToast } from '../context/ToastContext';
import { useApplications } from '../hooks/useApplications';
import { useDebounce } from '../hooks/useDebounce';
import { STATUSES, type Application, type ApplicationStatus } from '../types';
import { STATUS_META } from '../utils/statuses';

const SKELETON_CARDS = 2;

const byPosition = (a: Application, b: Application) => a.position - b.position;

// Returns a new array with the card moved to `status` at index `position`,
// and both affected columns renumbered 0, 1, 2, ... (the server does the same).
function moveLocally(
  apps: Application[],
  id: string,
  status: ApplicationStatus,
  position: number
): Application[] {
  const card = apps.find((a) => a._id === id);
  if (!card) return apps;
  const others = apps.filter((a) => a._id !== id);

  const target = others.filter((a) => a.status === status).sort(byPosition);
  target.splice(position, 0, { ...card, status });
  const renumbered = target.map((a, index) => ({ ...a, position: index }));

  // the column the card left closes its gap
  const source =
    card.status === status
      ? []
      : others
          .filter((a) => a.status === card.status)
          .sort(byPosition)
          .map((a, index) => ({ ...a, position: index }));

  const untouched = others.filter((a) => a.status !== status && a.status !== card.status);
  return [...untouched, ...source, ...renumbered];
}

// The area under a column's title that accepts dropped cards. Its id is the
// status, so dropping on an empty part of a column gives over.id === status.
function ColumnDropZone({
  status,
  cards,
  children,
}: {
  status: ApplicationStatus;
  cards: Application[];
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={`board-column-drop${isOver ? ' is-over' : ''}`}>
      <SortableContext items={cards.map((a) => a._id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}

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
  // `search` updates on every keystroke and drives the input; `debouncedSearch`
  // only catches up 300ms after typing stops, and is what goes to the server.
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300).trim();
  const { applications, setApplications, loading, error, refetch } = useApplications({
    q: debouncedSearch || undefined,
  });
  // the skeleton is only for the very first load; later reloads (a new search)
  // keep the current cards on screen until the new ones arrive
  const initialLoading = loading && applications.length === 0;

  // A filtered board only shows some cards, so positions worked out from it
  // would be wrong. Drag stays off while anything is typed, until the debounced
  // value has caught up, and while the full list is still loading back in.
  const dragDisabled = search.trim() !== '' || debouncedSearch !== '' || loading;
  const { showToast } = useToast();
  // Which modal is open: adding a new one, or editing one (null means none).
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);
  // The card whose details are open. Stored as an id and looked up in
  // `applications`, so the panel always shows the latest data.
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = applications.find((a) => a._id === viewingId) ?? null;

  // The panel's Edit and Delete close it first and then open the shared
  // modal, so only one dialog is on screen at a time.
  function editFromDetails(app: Application) {
    setViewingId(null);
    setEditing(app);
  }

  function deleteFromDetails(app: Application) {
    setViewingId(null);
    setDeleting(app);
  }
  // the id of the card being dragged, shown in the DragOverlay
  const [activeId, setActiveId] = useState<string | null>(null);

  // Mouse: a drag starts after moving 5px, so clicks (and Edit) still work.
  // Touch: press and hold 250ms first (moving more than 5px before that cancels),
  // so a normal swipe on a card scrolls the page and the board instead of dragging.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    // Keyboard: Tab to a card, Space/Enter picks it up, arrow keys move it,
    // Space/Enter drops it, Escape cancels.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || dragDisabled) return; // dropped outside the board, or drag is off

    const card = applications.find((a) => a._id === active.id);
    if (!card) return;
    const overCard = applications.find((a) => a._id === over.id);
    // when dropped on an empty part of a column, over.id is the status itself
    const status = overCard ? overCard.status : (over.id as ApplicationStatus);

    const column = applications.filter((a) => a.status === status).sort(byPosition);
    let position: number;
    // empty area: go to the end (in the same column the card itself is removed first)
    if (!overCard) position = status === card.status ? column.length - 1 : column.length;
    // on a card: take that card's index
    else position = column.findIndex((a) => a._id === overCard._id);

    // dropped back where it started: nothing to save
    if (status === card.status && position === column.findIndex((a) => a._id === card._id)) {
      return;
    }

    const previous = applications;
    setApplications(moveLocally(applications, card._id, status, position));

    try {
      await moveApplication(card._id, { status, position });
    } catch {
      setApplications(previous);
      showToast('Could not move the card. Try again.', 'error');
    }
  }

  const activeCard = activeId ? applications.find((a) => a._id === activeId) : undefined;

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

  if (initialLoading) {
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
  } else if (applications.length === 0 && debouncedSearch) {
    content = (
      <div className="state-box">
        <p>No applications match “{debouncedSearch}”.</p>
        <button type="button" className="state-button" onClick={() => setSearch('')}>
          Clear search
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
      <>
        {search.trim() !== '' && (
          <p className="board-hint" role="status">
            Clear the search to move cards.
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="board">
            {STATUSES.map((status) => (
              <BoardColumn key={status} status={status} count={columns[status].length}>
                <ColumnDropZone status={status} cards={columns[status]}>
                  {columns[status].length === 0 ? (
                    <p className="board-column-empty">No applications</p>
                  ) : (
                    <ul className="board-cards">
                      {columns[status].map((app) => (
                        <li key={app._id}>
                          <ApplicationCard
                            application={app}
                            onEdit={setEditing}
                            onOpen={(a) => setViewingId(a._id)}
                            dragDisabled={dragDisabled}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </ColumnDropZone>
              </BoardColumn>
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <ApplicationCardView
                application={activeCard}
                onEdit={setEditing}
                className="app-card-overlay"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </>
    );
  }

  // the "no applications yet" state has its own button, so don't show two
  const showHeaderAdd =
    !initialLoading && !error && (applications.length > 0 || debouncedSearch !== '');

  return (
    <>
      <div className="page-header">
        <h1>Board</h1>
        <div className="page-header-actions">
          <SearchBox value={search} onChange={setSearch} />
          {showHeaderAdd && addButton}
        </div>
      </div>
      {content}

      <ApplicationFormModal
        open={creating || editing !== null}
        application={editing}
        onClose={closeForm}
        onSaved={refetch}
      />

      <ApplicationDetailModal
        application={viewing}
        onClose={() => setViewingId(null)}
        onEdit={editFromDetails}
        onDelete={deleteFromDetails}
      />

      <DeleteApplicationModal
        application={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={refetch}
      />
    </>
  );
}
