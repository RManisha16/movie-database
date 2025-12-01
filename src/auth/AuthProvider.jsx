import React, { createContext, useContext, useEffect, useState } from "react";
 
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
 
const USERS_KEY = "movie_users";
const CURRENT_KEY = "movie_current_user";
 
function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
 
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem(CURRENT_KEY);
    if (email) {
      setUser({ email });
    }
  }, []);
 
  const login = async (email, password) => {

    await new Promise((r) => setTimeout(r, 400));
 
    if (!email) return { ok: false, message: "Email required" };
    if (!password) return { ok: false, message: "Password required" };
 
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, message: "No account found for that email" };
    if (found.password !== password) return { ok: false, message: "Invalid credentials" };
 

    localStorage.setItem(CURRENT_KEY, found.email);
    setUser({ email: found.email });
    return { ok: true };
  };
 
  const signup = async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));
 
    if (!email) return { ok: false, message: "Email required" };
    if (!password) return { ok: false, message: "Password required" };
 
    const users = readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { ok: false, message: "Email already registered" };
 
    users.push({ email, password });
    writeUsers(users);
 
    localStorage.setItem(CURRENT_KEY, email);
    setUser({ email });
    return { ok: true };
  };
 
  const logout = () => {
    localStorage.removeItem(CURRENT_KEY);
    setUser(null);
  };
 
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
 