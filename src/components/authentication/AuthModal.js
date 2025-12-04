import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import './AuthModal.css';

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  initialMode = 'login',
}) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setEmail('');
    setPassword('');
    setPassword2('');
    setError('');
  }, [initialMode, open]);

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = async (ev) => {
    ev?.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && password !== password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'login') res = await login(email, password);
      else res = await signup(email, password);

      if (res?.ok) {
        console.log('AuthModal: success -> calling onClose then onSuccess');
        onSuccess?.();
        onClose?.();
      } else {
        setError(res?.message || 'Auth failed');
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal">
        <h3 className="auth-title">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h3>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
          />

          {mode === 'signup' && (
            <>
              <label className="auth-label">Confirm Password</label>
              <input
                className="auth-input"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </>
          )}

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button type="submit" className="auth-primary" disabled={loading}>
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign up'}
            </button>
            <button
              type="button"
              className="auth-secondary"
              onClick={() => onClose?.()}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                className="link-btn"
                type="button"
                onClick={() => setMode('signup')}
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className="link-btn"
                type="button"
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
