import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return token && username ? { username, token } : null;
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setUser({ username: data.username, token: data.token });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  }, []);

  const register = useCallback(async (username, password) => {
    const { data } = await api.register(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setUser({ username: data.username, token: data.token });
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      username: user?.username || null,
      isAuthenticated: Boolean(user?.token),
      login,
      logout,
      register,
    }),
    [user, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {  
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 