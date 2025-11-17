/**
 * React hooks for authentication
 */

import { useState, useCallback, useEffect } from 'react';
import api, { APIError, LoginRequest, RegisterRequest } from '../services/api';

// ==================== Types ====================

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface UseAuthResult {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: APIError | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ==================== Hook ====================

/**
 * Hook for authentication management
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = api.auth.getToken();
    if (token) {
      // TODO: Could validate token with backend and get user info
      // For now, just mark as authenticated
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        // Store user info for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Login failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.register(data);
      if (response.success && response.user) {
        setUser(response.user);
        // Store user info for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Registration failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    localStorage.removeItem('user');
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: api.auth.isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };
}