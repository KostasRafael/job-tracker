import type { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onEdit: (application: Application) => void;
}

export default function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
  const { company, role, appliedAt, salary } = application;

  return (
    <article className="app-card">
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
