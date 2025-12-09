import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

const USERS_KEY = 'movie_users';
const CURRENT_KEY = 'movie_current_user';

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    // Throw so callers can handle uniformly.
    throw new Error(`Failed to read users: ${err?.message || 'unknown error'}`);
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    // Throw so callers can handle uniformly.
    throw new Error(
      `Failed to write users: ${err?.message || 'unknown error'}`
    );
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const email = localStorage.getItem(CURRENT_KEY);
      if (email) {
        setUser({ email });
      } else {
        setUser(null);
      }
    } catch (err) {
      // In effects we can't "return" an error to the caller; log and set to a safe state.
      console.error('Failed to initialize auth from storage:', err);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));

    const e = (email || '').trim();
    const p = (password || '').trim();

    if (!e) return { ok: false, message: 'Email required' };
    if (!p) return { ok: false, message: 'Password required' };

    let users;
    try {
      users = readUsers();
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to read users' };
    }

    const found = users.find(
      (u) => (u.email || '').toLowerCase() === e.toLowerCase()
    );

    if (!found)
      return { ok: false, message: 'No account found for that email' };
    if (found.password !== p)
      return { ok: false, message: 'Invalid credentials' };

    try {
      localStorage.setItem(CURRENT_KEY, found.email);
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to persist session' };
    }

    setUser({ email: found.email });
    return { ok: true };
  }, []);

  const signup = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));

    const e = (email || '').trim();
    const p = (password || '').trim();

    if (!e) return { ok: false, message: 'Email required' };
    if (!p) return { ok: false, message: 'Password required' };

    let users;
    try {
      users = readUsers();
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to read users' };
    }

    const existing = users.find(
      (u) => (u.email || '').toLowerCase() === e.toLowerCase()
    );
    if (existing) return { ok: false, message: 'Email already registered' };

    users.push({ email: e, password: p });

    try {
      writeUsers(users);
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to save account' };
    }

    try {
      localStorage.setItem(CURRENT_KEY, e);
    } catch (err) {
      return { ok: false, message: err.message || 'Failed to persist session' };
    }

    setUser({ email: e });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CURRENT_KEY);
    } catch (err) {
      // Return an error so callers can react (e.g., show toast).
      return { ok: false, message: err.message || 'Failed to clear session' };
    }
    setUser(null);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      initializing,
      login,
      signup,
      logout,
    }),
    [user, initializing, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
