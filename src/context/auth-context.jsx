'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, token: null, ready: false });

  useEffect(() => {
    async function bootstrap() {
      const token = window.localStorage.getItem('ucst_token');
      const storedUser = window.localStorage.getItem('ucst_user');

      if (!token) {
        setState({ user: null, token: null, ready: true });
        return;
      }

      try {
        const { data } = await api.get('/auth/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = data.user || (storedUser ? JSON.parse(storedUser) : null);
        if (user) {
          window.localStorage.setItem('ucst_user', JSON.stringify(user));
        }

        setState({ user, token, ready: true });
      } catch (error) {
        window.localStorage.removeItem('ucst_token');
        window.localStorage.removeItem('ucst_user');
        setState({ user: null, token: null, ready: true });
      }
    }

    bootstrap();
  }, []);

  const login = (payload) => {
    window.localStorage.setItem('ucst_token', payload.token);
    window.localStorage.setItem('ucst_user', JSON.stringify(payload.user));
    setState({ user: payload.user, token: payload.token, ready: true });
  };

  const logout = () => {
    window.localStorage.removeItem('ucst_token');
    window.localStorage.removeItem('ucst_user');
    setState({ user: null, token: null, ready: true });
  };

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}