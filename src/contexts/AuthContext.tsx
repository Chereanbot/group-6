"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  role: string;
  userRole: string;
  isAdmin: boolean;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (status === 'loading') {
        return;
      }

      if (status === 'authenticated' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.role,
          userRole: session.user.userRole,
          isAdmin: session.user.isAdmin,
          name: session.user.name
        });
      } else {
        // Try to get user from API as fallback
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [status, session]);

  const value = {
    user,
    loading,
    error,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 