import React, { createContext, useState, useEffect } from 'react';
import { signupUser, loginUser, logoutUser, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (err) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupUser(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Signup error:', err);
      const message = err.response?.data?.message || (err.request ? 'Server is unreachable' : 'Signup failed');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || (err.request ? 'Server is unreachable' : 'Login failed');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, login, logout, authenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
