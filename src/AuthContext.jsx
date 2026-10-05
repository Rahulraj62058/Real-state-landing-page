import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('token', d.token);
    setUser(d.user);
    return d.user;
  };

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (form) => authenticate('/auth/register', form);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Optimistic favourite toggle; rolls back if the server rejects it.
  const toggleFavorite = useCallback(async (propertyId) => {
    if (!user) return false;
    const currentFavs = user.favorites || [];
    const has = currentFavs.includes(propertyId);
    setUser((u) => ({ ...u, favorites: has ? (u?.favorites || []).filter((f) => f !== propertyId) : [...(u?.favorites || []), propertyId] }));
    try {
      await api(`/favorites/${propertyId}`, { method: 'POST' });
      return true;
    } catch {
      setUser((u) => ({ ...u, favorites: has ? [...(u?.favorites || []), propertyId] : (u?.favorites || []).filter((f) => f !== propertyId) }));
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}
