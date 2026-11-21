import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('hf_token'));

  useEffect(() => {
    if (!localStorage.getItem('hf_token')) return;
    api.get('/auth/me').then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('hf_token')).finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const { data } = await api.post(`/auth/${path}`, body);
    localStorage.setItem('hf_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);
  const logout = () => { localStorage.removeItem('hf_token'); setUser(null); };

  const toggleFavorite = async (id) => {
    const { data } = await api.post(`/properties/${id}/favorite`);
    setUser((u) => ({ ...u, favorites: data.favorites }));
  };
  return <Ctx.Provider value={{ user, loading, login: (b) => authenticate('login', b), signup: async (b) => (await api.post('/auth/signup', b)).data, logout, toggleFavorite }}>{children}</Ctx.Provider>;
}
