"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface Coordinator {
  id: string;
  type: 'PERMANENT' | 'PROJECT_BASED';
  status: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  office: {
    name: string;
  };
}

interface CoordinatorContextType {
  coordinators: Coordinator[];
  loading: boolean;
  error: string | null;
  deleteCoordinator: (id: string) => Promise<void>;
}

const CoordinatorContext = createContext<CoordinatorContextType>({
  coordinators: [],
  loading: false,
  error: null,
  deleteCoordinator: async () => {},
});

export function CoordinatorProvider({ children }: { children: React.ReactNode }) {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/coordinators', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to fetch coordinators');
      }

      const data = await response.json();
      setCoordinators(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err; // Let the error boundary handle it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators().catch(console.error);
  }, []);

  const deleteCoordinator = async (id: string) => {
    try {
      const response = await fetch(`/api/coordinators/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete coordinator');
      }

      await fetchCoordinators();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete coordinator');
      throw error;
    }
  };

  return (
    <CoordinatorContext.Provider
      value={{
        coordinators,
        loading,
        error,
        deleteCoordinator,
      }}
    >
      {children}
    </CoordinatorContext.Provider>
  );
}

export const useCoordinator = () => {
  const context = useContext(CoordinatorContext);
  if (!context) {
    throw new Error('useCoordinator must be used within a CoordinatorProvider');
  }
  return context;
}; 