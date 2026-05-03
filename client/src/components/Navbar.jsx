import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const close = () => { setMenuOpen(false); setDropdownOpen(false); }

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={close}>
        <img src={logo} alt="ALS Trade LTD" className="logo-img" />
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          <li><NavLink to="/"               end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/available-stock" className={({isActive}) => isActive ? 'active' : ''}>Available stock</NavLink></li>
          <li><NavLink to="/sold-stock"      className={({isActive}) => isActive ? 'active' : ''}>Sold stock</NavLink></li>
          <li><NavLink to="/how-it-works"    className={({isActive}) => isActive ? 'active' : ''}>How it works</NavLink></li>
          <li><NavLink to="/about-us"        className={({isActive}) => isActive ? 'active' : ''}>About us</NavLink></li>
          <li><NavLink to="/contact"         className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink></li>
        </ul>

       {/* Auth buttons */}
<div className="nav-auth">
  {user ? (
    <div className="nav-dropdown-wrap">
      <button className="nav-avatar-btn" onClick={() => setDropdownOpen(o => !o)}>
        <span className="nav-avatar">{user.companyName?.[0] || 'U'}</span>
        <span className="nav-user-dot" />
      </button>
      {dropdownOpen && (
  <div className="nav-dropdown">
          {user.role === 'admin' && (
            <Link to="/admin" className="nav-dd-item" onClick={close}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Admin
            </Link>
          )}
          <button className="nav-dd-item nav-dd-logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      )}
    </div>
  ) : (
    <>
      <Link to="/sign-in" className="btn btn-outline btn-sm">Log in</Link>
      <Link to="/sign-up" className="btn btn-primary btn-sm">Register</Link>
    </>
  )}
</div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/"               end onClick={close}>Home</NavLink>
        <NavLink to="/available-stock" onClick={close}>Available stock</NavLink>
        <NavLink to="/sold-stock"      onClick={close}>Sold stock</NavLink>
        <NavLink to="/how-it-works"    onClick={close}>How it works</NavLink>
        <NavLink to="/about-us"        onClick={close}>About us</NavLink>
        <NavLink to="/contact"         onClick={close}>Contact</NavLink>
        <div className="mobile-auth">
          {user ? (
            <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
          ) : (
            <>
              <Link to="/sign-in" className="btn btn-outline" onClick={close}>Log in</Link>
              <Link to="/sign-up" className="btn btn-primary" onClick={close}>Register free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
