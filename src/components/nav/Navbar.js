import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../auth/AuthProvider';
import AuthModal from '../authentication/AuthModal';

export default function Navbar() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const { isAuthenticated, user, logout } = useAuth();

  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const pendingAuthCallbackRef = useRef(null);

  useEffect(() => {
    const onOpenAuth = (e) => {
      const detail = e?.detail ?? {};
      if (detail.initialMode) setAuthMode(detail.initialMode);
      pendingAuthCallbackRef.current =
        typeof detail.onSuccess === 'function' ? detail.onSuccess : null;
      setOpenAuth(true);
    };

    window.addEventListener('openAuth', onOpenAuth);
    return () => {
      window.removeEventListener('openAuth', onOpenAuth);
    };
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setOpenAuth(false);

    const cb = pendingAuthCallbackRef.current;
    pendingAuthCallbackRef.current = null;

    if (typeof cb === 'function') {
      let tries = 0;
      const waitForAuth = () => {
        if (tries++ > 10) return;
        if (isAuthenticated) {
          setTimeout(() => cb(), 20);
        } else {
          setTimeout(waitForAuth, 50);
        }
      };
      waitForAuth();
    }
  }, [isAuthenticated]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = q.trim();
      if (!trimmed) return;
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [q, navigate]
  );

  const openLogin = useCallback(() => {
    setAuthMode('login');
    pendingAuthCallbackRef.current = null;
    setOpenAuth(true);
  }, []);

  const openSignup = useCallback(() => {
    setAuthMode('signup');
    pendingAuthCallbackRef.current = null;
    setOpenAuth(true);
  }, []);

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="brand">
          Flimhub
        </Link>
      </div>

      {/* CENTER — this container will center the search but allow right items to stay */}
      <div className="nav-center">
        <form className="search-form" onSubmit={onSubmit}>
          <input
            className="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search movies..."
            aria-label="Search movies"
          />
          {/* If this button is icon-only in CSS, keep an accessible label */}
          <button
            className="search-btn"
            type="submit"
            aria-label="Submit search"
          />
        </form>
      </div>

      <div className="nav-right">
        {!isAuthenticated ? (
          <>
            <button className="nav-auth-btn" onClick={openLogin}>
              Login
            </button>
            <button className="nav-auth-btn" onClick={openSignup}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14, opacity: 0.8, marginRight: 8 }}>
              Hi, {user.email}
            </span>
            <button className="nav-auth-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>

      {/* single App-level AuthModal (Navbar owns it) */}
      <AuthModal
        open={openAuth}
        initialMode={authMode}
        onClose={() => setOpenAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
}
