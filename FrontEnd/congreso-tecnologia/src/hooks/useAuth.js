// =====================================================
// Hook personalizado para manejo de autenticación
// Sistema de Gestión del Congreso de Tecnología
// =====================================================

import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getUserInscriptions = async () => {
    if (!isAuthenticated) {
      return [];
    }

    try {
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch('http://localhost:3001/api/activities/user/inscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data || [] : [];
      }
    } catch (error) {
      console.error('Error fetching user inscriptions:', error);
    }

    return [];
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getAuthToken,
    getUserInscriptions,
    checkAuthStatus
  };
};
