import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const login = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, login }),
}));

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  login.mockReset();
});

it('shows validation messages and does not call login when the form is empty', async () => {
  renderPage();

  await userEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  expect(login).not.toHaveBeenCalled();
});

it('calls login with the typed email and password', async () => {
  login.mockResolvedValue(undefined);
  renderPage();

  await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
  await userEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(login).toHaveBeenCalledTimes(1);
  expect(login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' });
});

it('shows the server error when login fails', async () => {
  login.mockRejectedValue(new Error('Invalid email or password'));
  renderPage();

  await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
  await userEvent.click(screen.getByRole('button', { name: /log in/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
});
