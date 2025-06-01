'use client';

import { ThemeProvider } from 'next-themes';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from '@/contexts/AdminContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense, useEffect, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { User } from '@prisma/client';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: User;
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (error === 'unauthorized') {
      toast.error('You do not have permission to access this page');
    } else if (error === 'server_error') {
      toast.error('An error occurred. Please try again later.');
    }
  }, [error]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please try again later or contact support if the problem persists.</p>
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      }
    >
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        }
      >
        <ClientProviders>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />
            <div className="ml-64 min-h-screen flex flex-col">
              <AdminHeader onMenuToggle={() => {}} />
              <main className="flex-1 p-6">{children}</main>
            </div>
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                }
              }} 
            />
          </div>
        </ClientProviders>
      </Suspense>
    </ErrorBoundary>
  );
} 