import { createContext, useCallback, useContext, useState } from 'react';
import { getToken, setToken, clearToken } from '../lib/api.js';

const AuthContext = createContext(null);
const USER_KEY = 'sm_user';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(loadUser);

  const setUser = useCallback((u) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
    setUserState(u);
  }, []);

  const login = useCallback((token, userData) => { setToken(token); setUser(userData); }, [setUser]);
  const logout = useCallback(() => { clearToken(); setUser(null); }, [setUser]);
  const refreshUser = useCallback((u) => setUser(u), [setUser]);

  const isLoggedIn = Boolean(user && getToken());
  const isAdmin = Boolean(user && (user.permissions || []).length > 0);
  const can = useCallback((permission) => (user?.permissions || []).includes(permission), [user]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, can, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
