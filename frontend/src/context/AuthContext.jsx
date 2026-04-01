import React, { createContext, useState, useEffect } from 'react';
import { signupUser, loginUser, logoutUser, getCurrentUser } from '../modules/auth/services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Timeout: Render free tier cold starts can take 30-60s.
        // We give it 8s max — if no response, treat user as logged out.
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 8000)
        );
        const data = await Promise.race([getCurrentUser(), timeoutPromise]);
        setUser(data.user);
      } catch (err) {
        // Not authenticated OR backend is cold starting — either way, show the app
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
      if (data.token) localStorage.setItem('token', data.token); // ✅ Sync with Extension
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
      if (data.token) localStorage.setItem('token', data.token); // ✅ Sync with Extension
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
      localStorage.removeItem('token'); // ✅ Clear Extension Session
      await logoutUser();
      setUser(null);
      // Hard redirect: clears ALL React state + TanStack Query cache
      // This is the most reliable way to guarantee full session teardown
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      window.location.href = '/login'; // Force logout even if API call fails
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
