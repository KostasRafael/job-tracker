import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// The login page is swapped for one that throws, to trigger the error boundary.
vi.mock('./pages/LoginPage', () => ({
  default: () => {
    throw new Error('boom');
  },
}));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

it('shows the 404 page with a link back to the board for an unknown URL', () => {
  renderAt('/no-such-page');

  expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /back to the board/i })).toHaveAttribute('href', '/');
  expect(document.title).toBe('Page not found | Job Tracker');
});

it('shows the fallback instead of a blank page when a component crashes', () => {
  // React logs the caught error to the console; keep the test output clean
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  renderAt('/login');
  spy.mockRestore();

  expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i);
});
