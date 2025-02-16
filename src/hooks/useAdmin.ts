import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Verify token and admin status
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.isAdmin) {
          router.push('/login');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin verification failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  return { isLoading, isAdmin };
}; 