"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KebeleManagerRoot() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const managerId = localStorage.getItem('managerId');
    const kebeleId = localStorage.getItem('kebeleId');

    if (managerId && kebeleId) {
      // If authenticated, redirect to dashboard
      router.push('/kebele-manager/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.push('/kebele-manager/login');
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
    </div>
  );
} 