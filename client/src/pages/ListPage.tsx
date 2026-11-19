import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApplicationFormModal from '../components/ApplicationFormModal';
import DeleteApplicationModal from '../components/DeleteApplicationModal';
import SearchBox from '../components/SearchBox';
import StatusBadge from '../components/StatusBadge';
import { useApplications } from '../hooks/useApplications';
import { useDebounce } from '../hooks/useDebounce';
import { STATUSES, type Application, type ApplicationStatus } from '../types';
import { STATUS_META } from '../utils/statuses';

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

type ListSort = 'newest' | 'oldest' | 'company';
const DEFAULT_SORT: ListSort = 'newest';
const SORT_OPTIONS: { value: ListSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'company', label: 'Company A to Z' },
];

// The URL is plain text that anyone can edit, so only accept known values.
function parseStatus(value: string | null): ApplicationStatus | undefined {
  // '' (All statuses) or anything unknown means no filter
  return STATUSES.includes(value as ApplicationStatus) ? (value as ApplicationStatus) : undefined;
}

function parseSort(value: string | null): ListSort {
  return SORT_OPTIONS.some((o) => o.value === value) ? (value as ListSort) : DEFAULT_SORT;
}

function TableShell({ children, busy = false }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="table-scroll">
      <table className="app-table" aria-busy={busy}>
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Applied</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function ListPage() {
  // Search, status and sort live in the URL (/list?q=acme&status=applied&sort=oldest),
  // so a refresh keeps them and the link can be shared.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const status = parseStatus(searchParams.get('status'));
  const sort = parseSort(searchParams.get('sort'));

  // Sets one URL value, or removes it when empty/default, keeping the others.
  // replace: true so typing a search doesn't add a history entry per keystroke.
  function setParam(key: 'q' | 'status' | 'sort', value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || (key === 'sort' && value === DEFAULT_SORT)) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  }

  // One update, not two setParam calls: each call starts from the current URL,
  // so a second call would undo the first.
  function clearFilters() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('q');
        next.delete('status');
        return next;
      },
      { replace: true }
    );
  }

  // `search` drives the input; the debounced copy is what goes to the server
  const debouncedSearch = useDebounce(search, 300).trim();
  const filtered = debouncedSearch !== '' || status !== undefined;
  const { applications, loading, error, refetch } = useApplications({
    q: debouncedSearch || undefined,
    status,
    sort,
  });
  // the skeleton is only for the very first load; a new search keeps the
  // current rows on screen until the results arrive
  const initialLoading = loading && applications.length === 0;

  // Which modal is open: creating a new one, editing one, or confirming a delete.
  // null means "none".
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);

  const formOpen = creating || editing !== null;

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const addButton = (
    <button type="button" className="button-primary" onClick={() => setCreating(true)}>
      Add application
    </button>
  );

  let content: ReactNode;

  if (initialLoading) {
    content = (
      <>
        <p className="visually-hidden" role="status">
          Loading applications...
        </p>
        <TableShell busy>
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <tr key={row} className="skeleton-row" aria-hidden="true">
              {Array.from({ length: COLUMN_COUNT }, (_, col) => (
                <td key={col}>
                  <span className="skeleton" />
                </td>
              ))}
            </tr>
          ))}
        </TableShell>
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
  } else if (applications.length === 0 && filtered) {
    content = (
      <div className="state-box">
        <p>No applications match your filters.</p>
        <button type="button" className="state-button" onClick={clearFilters}>
          Clear filters
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
      <TableShell>
        {applications.map((app) => (
          <tr key={app._id}>
            <td>{app.company}</td>
            <td>{app.role}</td>
            <td>
              <StatusBadge status={app.status} />
            </td>
            <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</td>
            <td>
              <div className="row-actions">
                <button
                  type="button"
                  className="button-secondary button-small"
                  onClick={() => setEditing(app)}
                  aria-label={`Edit ${app.role} at ${app.company}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="button-danger-outline button-small"
                  onClick={() => setDeleting(app)}
                  aria-label={`Delete ${app.role} at ${app.company}`}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableShell>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>List</h1>
        <div className="page-header-actions">
          <SearchBox value={search} onChange={(value) => setParam('q', value)} />
          <label className="filter-select">
            <span className="visually-hidden">Filter by status</span>
            {/* a <select> always gives text: '' means All statuses */}
            <select value={status ?? ''} onChange={(e) => setParam('status', e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span className="visually-hidden">Sort by</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {/* the "no applications yet" state has its own button, so don't show two */}
          {!initialLoading && !error && (applications.length > 0 || filtered) && addButton}
        </div>
      </div>
      {content}

      <ApplicationFormModal
        open={formOpen}
        application={editing}
        onClose={closeForm}
        onSaved={refetch}
      />

      <DeleteApplicationModal
        application={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={refetch}
      />
    </>
  );
}
