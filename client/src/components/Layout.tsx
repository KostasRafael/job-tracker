import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand">Job Tracker</span>
        <div className="navbar-links">
          <NavLink to="/" end>Board</NavLink>
          <NavLink to="/list">List</NavLink>
          <NavLink to="/stats">Stats</NavLink>
        </div>
        {/* Day 9: user's name and logout button go here */}
        <div className="navbar-user"></div>
      </nav>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
