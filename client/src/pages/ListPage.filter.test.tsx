import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListPage from './ListPage';
import { listApplications } from '../api/applications';
import type { Application } from '../types';

// Mock the API, not the hook, so the real useApplications runs and we can see
// what the filter actually sends to the server.
vi.mock('../api/applications');

// The add/edit and delete modals call useToast even while closed.
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const applications: Application[] = [
  {
    _id: 'app-1',
    company: 'Acme Corp',
    role: 'Frontend Developer',
    status: 'interview',
    position: 0,
    createdAt: '2026-11-05T00:00:00.000Z',
  },
];

beforeEach(() => {
  vi.mocked(listApplications).mockReset().mockResolvedValue(applications);
});

it('asks the API for interview applications when that status is chosen', async () => {
  render(
    <MemoryRouter>
      <ListPage />
    </MemoryRouter>
  );

  // wait for the first load to finish before changing the filter
  expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  expect(listApplications).not.toHaveBeenCalledWith(
    expect.objectContaining({ status: 'interview' })
  );

  await userEvent.selectOptions(screen.getByLabelText(/filter by status/i), 'interview');

  await waitFor(() =>
    expect(listApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'interview' })
    )
  );
});
