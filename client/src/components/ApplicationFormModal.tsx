import { createApplication, updateApplication } from '../api/applications';
import { useToast } from '../context/ToastContext';
import type { Application, ApplicationInput } from '../types';
import ApplicationForm from './ApplicationForm';
import Modal from './Modal';

interface ApplicationFormModalProps {
  open: boolean;
  application: Application | null; // the one being edited, or null when adding
  onClose: () => void;
  onSaved: () => void | Promise<void>; // usually the page's refetch
}

// The add/edit modal, shared by the list and the board. It calls the API,
// shows a toast, and then tells the page to close it and refresh.
export default function ApplicationFormModal({
  open,
  application,
  onClose,
  onSaved,
}: ApplicationFormModalProps) {
  const { showToast } = useToast();

  // On failure: show a toast, then rethrow so the modal stays open and
  // ApplicationForm shows the message too.
  async function handleSubmit(data: ApplicationInput) {
    try {
      if (application) {
        await updateApplication(application._id, data);
      } else {
        await createApplication(data);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
      throw err;
    }
    showToast(application ? 'Changes saved' : 'Application added');
    onClose();
    await onSaved();
  }

  return (
    <Modal open={open} title={application ? 'Edit application' : 'Add application'} onClose={onClose}>
      {/* render the form only while open, and key it by the application,
          so it always starts from the right values */}
      {open && (
        <ApplicationForm
          key={application?._id ?? 'new'}
          initialValues={application ?? undefined}
          submitLabel={application ? 'Save changes' : 'Add application'}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
