import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);

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
            <>
              <span className="nav-user">
                <span className="nav-user-dot" />
                {user.companyName}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
            </>
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
