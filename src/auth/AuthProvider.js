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
  } catch {
    return [];
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem(CURRENT_KEY);
    if (email) {
      setUser({ email });
    } else {
      setUser(null);
    }
    setInitializing(false);
  }, []);

  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));

    const e = (email || '').trim();
    const p = (password || '').trim();

    if (!e) return { ok: false, message: 'Email required' };
    if (!p) return { ok: false, message: 'Password required' };

    const users = readUsers();
    const found = users.find(
      (u) => (u.email || '').toLowerCase() === e.toLowerCase()
    );

    if (!found)
      return { ok: false, message: 'No account found for that email' };
    if (found.password !== p)
      return { ok: false, message: 'Invalid credentials' };

    try {
      localStorage.setItem(CURRENT_KEY, found.email);
    } catch {}
    setUser({ email: found.email });
    return { ok: true };
  }, []);

  const signup = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));

    const e = (email || '').trim();
    const p = (password || '').trim();

    if (!e) return { ok: false, message: 'Email required' };
    if (!p) return { ok: false, message: 'Password required' };

    const users = readUsers();
    const existing = users.find(
      (u) => (u.email || '').toLowerCase() === e.toLowerCase()
    );
    if (existing) return { ok: false, message: 'Email already registered' };

    users.push({ email: e, password: p });
    writeUsers(users);

    try {
      localStorage.setItem(CURRENT_KEY, e);
    } catch {}
    setUser({ email: e });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CURRENT_KEY);
    } catch {}
    setUser(null);
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
