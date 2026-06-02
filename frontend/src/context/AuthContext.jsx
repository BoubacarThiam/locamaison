import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('lm_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('lm_token'));

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('lm_token', data.data.token);
    localStorage.setItem('lm_user',  JSON.stringify(data.data.user));
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // Connexion directe avec token déjà obtenu (ex: après inscription)
  const loginWithData = useCallback((token, user) => {
    localStorage.setItem('lm_token', token);
    localStorage.setItem('lm_user',  JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      localStorage.setItem('lm_user', JSON.stringify(data.data));
    } catch { logout(); }
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user, token, login, loginWithData, logout, refreshUser,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
