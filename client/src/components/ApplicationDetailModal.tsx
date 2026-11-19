import type { Application } from '../types';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

interface ApplicationDetailModalProps {
  application: Application | null; // the one to show, or null when closed
  onClose: () => void;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
}

// Only http(s) links become clickable. The URL is typed in by the user, and an
// href like "javascript:..." would run code when clicked.
function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null; // not a full URL, e.g. "acme.com/jobs"
  }
}

const NOT_SET = <span className="detail-empty">Not set</span>;

// Everything about one application, opened by clicking a card on the board.
export default function ApplicationDetailModal({
  application,
  onClose,
  onEdit,
  onDelete,
}: ApplicationDetailModalProps) {
  return (
    <Modal
      open={application !== null}
      title={application ? application.company : 'Application'}
      onClose={onClose}
    >
      {application && <DetailBody application={application} onEdit={onEdit} onDelete={onDelete} />}
    </Modal>
  );
}

function DetailBody({
  application,
  onEdit,
  onDelete,
}: {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
}) {
  const { role, status, url, location, salary, appliedAt, notes } = application;
  const href = safeUrl(url);

  return (
    <div className="detail-body">
      <div className="detail-heading">
        <p className="detail-role">{role}</p>
        <StatusBadge status={status} />
      </div>

      <dl className="detail-list">
        <div>
          <dt>Job posting</dt>
          <dd>
            {href ? (
              // noopener noreferrer: the new tab gets no handle back to this one
              <a href={href} target="_blank" rel="noopener noreferrer">
                {url}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              // a value that isn't a safe link is still shown, just as text
              (url ?? NOT_SET)
            )}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{location || NOT_SET}</dd>
        </div>
        <div>
          <dt>Salary</dt>
          {/* salary 0 is falsy, so compare against undefined */}
          <dd>{salary !== undefined ? salary.toLocaleString() : NOT_SET}</dd>
        </div>
        <div>
          <dt>Applied</dt>
          <dd>{appliedAt ? new Date(appliedAt).toLocaleDateString() : 'Not yet'}</dd>
        </div>
        <div className="detail-notes-row">
          <dt>Notes</dt>
          <dd className="detail-notes">{notes || NOT_SET}</dd>
        </div>
      </dl>

      <div className="form-actions">
        <button
          type="button"
          className="button-danger-outline"
          onClick={() => onDelete(application)}
        >
          Delete
        </button>
        <button type="button" className="button-primary" onClick={() => onEdit(application)}>
          Edit
        </button>
      </div>
    </div>
  );
}
