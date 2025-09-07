import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  useEffect(() => { token ? localStorage.setItem('token', token) : localStorage.removeItem('token'); }, [token]);
  useEffect(() => { user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user'); }, [user]);

  const login = (t,u) => { setToken(t); setUser(u); };
  const logout = () => { setToken(''); setUser(null); };

  return <AuthCtx.Provider value={{ token, user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
