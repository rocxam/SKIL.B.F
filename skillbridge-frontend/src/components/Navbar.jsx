import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo.jsx';

function dashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/student';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Logo />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav me-auto">
            <NavLink className="nav-link" to="/courses">Courses</NavLink>
            <NavLink className="nav-link" to="/poster">Poster</NavLink>
            <NavLink className="nav-link" to="/about">About</NavLink>
            {user && <NavLink className="nav-link" to={dashboardPath(user.role)}>Dashboard</NavLink>}
          </div>
          <div className="navbar-nav align-items-lg-center gap-2">
            {user ? (
              <>
                <span className="navbar-text text-white-50">{user.full_name}</span>
                <button className="btn btn-light btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/login">Login</NavLink>
                <Link className="btn btn-light btn-sm" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
