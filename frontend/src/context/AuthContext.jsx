import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('flowra_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('flowra_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('flowra_token');
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          localStorage.setItem('flowra_user', JSON.stringify(profile));
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem('flowra_token');
          localStorage.removeItem('flowra_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const authToken = res.token;
    const authUser = res.data;

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('flowra_token', authToken);
    localStorage.setItem('flowra_user', JSON.stringify(authUser));
    return authUser;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const authToken = res.token;
    const authUser = res.data;

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('flowra_token', authToken);
    localStorage.setItem('flowra_user', JSON.stringify(authUser));
    return authUser;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('flowra_user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ADMIN',
    isProjectManager: user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
