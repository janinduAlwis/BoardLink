import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: 'var(--ios-blue)' }}>
          BoardLink
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {user && user.role_name === 'Admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin" style={{ color: 'var(--ios-text)' }}>
                  Admin Panel
                </Link>
              </li>
            )}
            {user && user.role_name === 'Tenant' && (
              <li className="nav-item">
                <Link className="nav-link" to="/tenant" style={{ color: 'var(--ios-text)' }}>
                  Tenant Portal
                </Link>
              </li>
            )}
            {user && user.role_name === 'Staff' && (
              <li className="nav-item">
                <Link className="nav-link" to="/staff" style={{ color: 'var(--ios-text)' }}>
                  Staff Portal
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <span className="me-3 small" style={{ color: 'var(--ios-text-muted)' }}>
                  Hello, <strong style={{ color: 'var(--ios-text)' }}>{user.full_name}</strong>
                </span>
                <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-secondary btn-sm me-2 rounded-pill px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary btn-sm rounded-pill px-3" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
