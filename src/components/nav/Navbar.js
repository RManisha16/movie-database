import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../auth/AuthProvider";
import AuthModal from "../authentication/AuthModal";
 
const Navbar = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
 
  const { isAuthenticated, user, logout } = useAuth();
 
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const pendingAuthCallbackRef = useRef(null);
 
  useEffect(() => {
    function onOpenAuth(e) {
      const detail = e?.detail ?? {};
      if (detail.initialMode) setAuthMode(detail.initialMode);
      pendingAuthCallbackRef.current = typeof detail.onSuccess === "function" ? detail.onSuccess : null;
      setOpenAuth(true);
    }
    window.addEventListener("openAuth", onOpenAuth);
    return () => window.removeEventListener("openAuth", onOpenAuth);
  }, []);
  
  const handleAuthSuccess = () => {
    console.log("Navbar: handleAuthSuccess called");
    setOpenAuth(false);
    const cb = pendingAuthCallbackRef.current;
    pendingAuthCallbackRef.current = null;
    if (typeof cb === "function") {
      let tries = 0;
      function waitForAuth() {
        if (tries++ > 10) return; 
        if (isAuthenticated) {
          setTimeout(() => cb(), 20);
        } else {
          setTimeout(waitForAuth, 50);
        }
      }
      waitForAuth();
    }
  };
 
  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };
 
  const openLogin = () => {
    setAuthMode("login");
    pendingAuthCallbackRef.current = null;
    setOpenAuth(true);
  };
 
  const openSignup = () => {
    setAuthMode("signup");
    pendingAuthCallbackRef.current = null;
    setOpenAuth(true);
  };
 
  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <Link to="/" className="brand">Flimhub</Link>
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
          <button className="search-btn" type="submit"></button>
        </form>
      </div>
 
      <div className="nav-right">
        {!isAuthenticated ? (
          <>
            <button className="nav-auth-btn" onClick={openLogin}>Login</button>
            <button className="nav-auth-btn" onClick={openSignup}>Sign Up</button>
          </>
        ) : (
          <>
            <span style={{fontSize:14, opacity:0.8, marginRight:8}}>Hi, {user.email}</span>
            <button className="nav-auth-btn" onClick={logout}>Logout</button>
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
};
 
export default Navbar;
 