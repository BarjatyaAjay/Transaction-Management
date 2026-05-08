import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            💰 Finance Tracker
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/transactions" className="nav-link">Transactions</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
        </div>

        <div className="navbar-end">
          <span className="user-info">
            {user.email}
            <span className={`role-badge role-${user.role}`}>
              {user.role}
            </span>
          </span>
          <button
            className="btn btn-danger"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
