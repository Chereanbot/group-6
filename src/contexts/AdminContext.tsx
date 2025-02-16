"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getAvatarUrl } from '@/utils/avatar';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  userRole: string;
  status: string;
  isAdmin: boolean;
  avatar?: string;
}

interface AdminContextType {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadAdminData = async () => {
    try {
      // Check both token and session
      const token = localStorage.getItem('token');
      const cookieToken = document.cookie.match(/auth-token=([^;]+)/)?.[1];

      if (!token && !cookieToken) {
        router.push('/login');
        return;
      }

      // Try to verify with token
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || cookieToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (!data.isAuthenticated || !data.user) {
        throw new Error('Unauthorized access');
      }

      // Verify admin role
      if (!data.user.isAdmin) {
        throw new Error('Unauthorized access - Admin only');
      }

      // Add avatar URL to user data
      const userWithAvatar = {
        ...data.user,
        avatar: getAvatarUrl(data.user.email)
      };

      setUser(userWithAvatar);
      setError(null);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Authentication failed');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <AdminContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 