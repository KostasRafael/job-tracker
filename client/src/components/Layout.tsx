import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">Job Tracker</span>
        <div className="navbar-links">
          <NavLink to="/" end>Board</NavLink>
          <NavLink to="/list">List</NavLink>
          <NavLink to="/stats">Stats</NavLink>
        </div>
        <div className="navbar-user">
          <span className="navbar-user-name">{user?.name}</span>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
