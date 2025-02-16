"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Office {
  id: string;
  name: string;
}

export function useOffices() {
  const { data: session } = useSession();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffices() {
      try {
        const response = await fetch('/api/offices', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch offices');
        }

        const data = await response.json();
        setOffices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchOffices();
    }
  }, [session]);

  return { offices, loading, error };
} 