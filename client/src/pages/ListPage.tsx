import type { ReactNode } from 'react';
import StatusBadge from '../components/StatusBadge';
import { useApplications } from '../hooks/useApplications';

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
          {/* Actions column: filled in on Day 11 */}
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export default function ListPage() {
  const { applications, loading, error, refetch } = useApplications();

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
        {/* Add button goes here in the next days */}
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
            <td></td>
          </tr>
        ))}
      </TableShell>
    );
  }

  return (
    <>
      <h1>List</h1>
      {content}
    </>
  );
}
