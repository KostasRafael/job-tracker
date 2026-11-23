import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListPage from './ListPage';
import { useApplications } from '../hooks/useApplications';

vi.mock('../hooks/useApplications', () => ({
  useApplications: vi.fn(),
}));

// The add/edit and delete modals call useToast even while closed.
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const mockedUseApplications = vi.mocked(useApplications);

function mockHook(overrides: { error?: string | null } = {}) {
  mockedUseApplications.mockReturnValue({
    applications: [],
    setApplications: vi.fn(),
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
}

function renderPage() {
  render(
    <MemoryRouter>
      <ListPage />
    </MemoryRouter>
  );
}

it('shows the empty message when there are no applications', () => {
  mockHook();
  renderPage();

  expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
});

it('shows the error message and a Try again button when loading fails', () => {
  mockHook({ error: 'Network error' });
  renderPage();

  expect(screen.getByRole('alert')).toHaveTextContent('Network error');
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});
