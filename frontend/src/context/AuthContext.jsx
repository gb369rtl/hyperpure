import { createContext, useContext, useState, useCallback } from 'react';
import { getToken, setToken as storeToken, clearToken } from '../lib/api.js';

const KEY = 'sm_admin_user';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(loadUser);

  const setUser = useCallback((userData) => {
    if (userData) localStorage.setItem(KEY, JSON.stringify(userData));
    else localStorage.removeItem(KEY);
    setUserState(userData);
  }, []);

  const login = useCallback((token, userData) => {
    storeToken(token);
    setUser(userData);
  }, [setUser]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, [setUser]);

  const can = useCallback((permission) => {
    return (user?.permissions || []).includes(permission);
  }, [user]);

  // Refresh user from latest login response (e.g. after /me call)
  const refreshUser = useCallback((userData) => setUser(userData), [setUser]);

  return (
    <AuthContext.Provider value={{ user, can, login, logout, refreshUser, isLoggedIn: !!getToken() }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
