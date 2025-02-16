import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { fetchWrapper } from '@/utils/fetchWrapper';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // Get auth headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Try to get token from localStorage first
      let token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
      // If no token in localStorage, try to get from cookie
      if (!token && typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
        if (authCookie) {
          token = authCookie.split('=')[1].trim();
        }
      }

      if (!token) {
        setIsAuthenticated(false);
        return false;
      }

      // Add token to headers
      headers.Authorization = `Bearer ${token}`;

      // Verify token
      const response = await fetchWrapper.post('/api/auth/verify', {
        headers,
        credentials: 'include'
      });

      const isValid = response.ok;
      setIsAuthenticated(isValid);
      return isValid;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    loading,
    checkAuth
  };
}; 