import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../data/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      error: null,
      login: async () => {
        throw new Error('AuthProvider is missing. Wrap the component tree with AuthProvider.');
      },
      signup: async () => {
        throw new Error('AuthProvider is missing. Wrap the component tree with AuthProvider.');
      },
      logout: () => {
        throw new Error('AuthProvider is missing. Wrap the component tree with AuthProvider.');
      },
      fetchCurrentUser: async () => {
        throw new Error('AuthProvider is missing. Wrap the component tree with AuthProvider.');
      },
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          setUser(data.data.user);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token: newToken, data: userData } = data;

      setToken(newToken);
      setUser(userData.user);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData.user));

      return userData.user;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      const { token: newToken, data: userData } = data;

      setToken(newToken);
      setUser(userData.user);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData.user));

      return userData.user;
    } catch (err) {
      const errorMsg = err.message || 'Signup failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, signup, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
