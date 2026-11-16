import { useState, type ChangeEvent, type FormEvent } from 'react';
import { STATUSES, type Application, type ApplicationInput, type ApplicationStatus } from '../types';
import { STATUS_META } from '../utils/statuses';

interface ApplicationFormProps {
  initialValues?: Application; // present when editing
  submitLabel: string;
  onSubmit: (values: ApplicationInput) => Promise<void>;
  onCancel: () => void;
}

// form fields always hold text, so every field is a string here
interface FormState {
  company: string;
  role: string;
  url: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function toFormState(application?: Application): FormState {
  return {
    company: application?.company ?? '',
    role: application?.role ?? '',
    url: application?.url ?? '',
    location: application?.location ?? '',
    salary: application?.salary?.toString() ?? '',
    status: application?.status ?? 'wishlist',
    // "2026-11-05T00:00:00.000Z" -> "2026-11-05", the format a date input accepts
    appliedAt: application?.appliedAt?.slice(0, 10) ?? '',
    notes: application?.notes ?? '',
  };
}

function toInput(values: FormState): ApplicationInput {
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    status: values.status,
    ...(values.url ? { url: values.url.trim() } : {}),
    ...(values.location ? { location: values.location.trim() } : {}),
    ...(values.salary ? { salary: Number(values.salary) } : {}),
    ...(values.appliedAt ? { appliedAt: values.appliedAt } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
  };
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function ApplicationForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialValues));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  }

  function validate() {
    const errors: FieldErrors = {};
    if (!values.company.trim()) errors.company = 'Company is required';
    if (!values.role.trim()) errors.role = 'Role is required';
    const url = values.url.trim();
    if (url && !isValidUrl(url)) errors.url = 'Enter a full URL, such as https://example.com';
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(toInput(values));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="application-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="form-alert" role="alert">
          {serverError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="company">Company *</label>
        <input
          id="company"
          name="company"
          value={values.company}
          onChange={handleChange}
          aria-invalid={!!fieldErrors.company}
        />
        {fieldErrors.company && <p className="field-error">{fieldErrors.company}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="role">Role *</label>
        <input
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          aria-invalid={!!fieldErrors.role}
        />
        {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="url">Job posting URL</label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://"
          value={values.url}
          onChange={handleChange}
          aria-invalid={!!fieldErrors.url}
        />
        {fieldErrors.url && <p className="field-error">{fieldErrors.url}</p>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" value={values.location} onChange={handleChange} />
        </div>

        <div className="form-field">
          <label htmlFor="salary">Salary</label>
          <input
            id="salary"
            name="salary"
            type="number"
            min="0"
            value={values.salary}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={handleChange}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="appliedAt">Applied date</label>
          <input
            id="appliedAt"
            name="appliedAt"
            type="date"
            value={values.appliedAt}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={4} value={values.notes} onChange={handleChange} />
      </div>

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
