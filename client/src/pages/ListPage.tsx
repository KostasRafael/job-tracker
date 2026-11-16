import { useState, type ReactNode } from 'react';
import { createApplication, deleteApplication, updateApplication } from '../api/applications';
import ApplicationForm from '../components/ApplicationForm';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useApplications } from '../hooks/useApplications';
import type { Application, ApplicationInput } from '../types';

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

function TableShell({ children, busy = false }: { children: ReactNode; busy?: boolean }) {
  return (
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
  );
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong';
}

export default function ListPage() {
  const { applications, loading, error, refetch } = useApplications();
  const { showToast } = useToast();

  // Which modal is open: creating a new one, editing one, or confirming a delete.
  // null means "none".
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<Application | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formOpen = creating || editing !== null;

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  // On failure: show a toast, then rethrow so the modal stays open and
  // ApplicationForm shows the message under its submit state too.
  async function handleSave(data: ApplicationInput) {
    try {
      if (editing) {
        await updateApplication(editing._id, data);
      } else {
        await createApplication(data);
      }
    } catch (err) {
      showToast(errorMessage(err), 'error');
      throw err;
    }
    showToast(editing ? 'Changes saved' : 'Application added');
    closeForm();
    await refetch();
  }

  function openDelete(app: Application) {
    setDeleteError(null);
    setDeleting(app);
  }

  // No "busy" guard here: Escape closes a <dialog> natively, so the state must
  // always follow, or the modal would think it is still open.
  function closeDelete() {
    setDeleting(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await deleteApplication(deleting._id);
      showToast('Application deleted');
      setDeleting(null);
      await refetch();
    } catch (err) {
      const message = errorMessage(err);
      setDeleteError(message);
      showToast(message, 'error');
    } finally {
      setDeleteBusy(false);
    }
  }

  const addButton = (
    <button type="button" className="button-primary" onClick={() => setCreating(true)}>
      Add application
    </button>
  );

  let content: ReactNode;

  if (loading) {
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
                  onClick={() => openDelete(app)}
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
        {/* the empty state has its own button, so don't show two */}
        {!loading && !error && applications.length > 0 && addButton}
      </div>
      {content}

      <Modal
        open={formOpen}
        title={editing ? 'Edit application' : 'Add application'}
        onClose={closeForm}
      >
        {/* render the form only while open, and key it by the application,
            so it always starts from the right values */}
        {formOpen && (
          <ApplicationForm
            key={editing?._id ?? 'new'}
            initialValues={editing ?? undefined}
            submitLabel={editing ? 'Save changes' : 'Add application'}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <Modal open={deleting !== null} title="Delete application" onClose={closeDelete}>
        {deleting && (
          <div className="confirm-body">
            {deleteError && (
              <div className="form-alert" role="alert">
                {deleteError}
              </div>
            )}
            <p>
              Delete the application for <strong>{deleting.role}</strong> at{' '}
              <strong>{deleting.company}</strong>? This cannot be undone.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={closeDelete}
                disabled={deleteBusy}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-danger"
                onClick={() => void confirmDelete()}
                disabled={deleteBusy}
              >
                {deleteBusy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
