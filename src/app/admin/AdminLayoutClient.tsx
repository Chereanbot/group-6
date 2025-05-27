'use client';

import { ThemeProvider } from 'next-themes';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from '@/contexts/AdminContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRouter } from 'next/navigation';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AdminProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const router = useRouter();

  return (
    <ErrorBoundary 
      fallback={<div>Something went wrong! Please try again later.</div>}
    >
      <Suspense fallback={<div>Loading...</div>}>
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