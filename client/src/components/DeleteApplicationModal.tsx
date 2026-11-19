import { useState } from 'react';
import { deleteApplication } from '../api/applications';
import { useToast } from '../context/ToastContext';
import type { Application } from '../types';
import Modal from './Modal';

interface DeleteApplicationModalProps {
  application: Application | null; // the one to delete, or null when closed
  onClose: () => void;
  onDeleted: () => void | Promise<void>; // usually the page's refetch
}

// The "are you sure?" modal, shared by the list and the board.
export default function DeleteApplicationModal({
  application,
  onClose,
  onDeleted,
}: DeleteApplicationModalProps) {
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No "busy" guard here: Escape closes a <dialog> natively, so the state must
  // always follow, or the modal would think it is still open.
  function close() {
    setError(null);
    onClose();
  }

  async function confirm() {
    if (!application) return;
    setBusy(true);
    setError(null);
    try {
      await deleteApplication(application._id);
      showToast('Application deleted');
      close();
      await onDeleted();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={application !== null} title="Delete application" onClose={close}>
      {application && (
        <div className="confirm-body">
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          <p>
            Delete the application for <strong>{application.role}</strong> at{' '}
            <strong>{application.company}</strong>? This cannot be undone.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={close}
              disabled={busy}
              autoFocus
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-danger"
              onClick={() => void confirm()}
              disabled={busy}
            >
              {busy ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
