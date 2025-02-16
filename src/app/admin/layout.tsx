import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from '@/contexts/AdminContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { authOptions, verifyAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Du las',
  description: 'Admin dashboard for managing legal services',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <AdminProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong! Please try again later.</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientProviders>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />
            <div className="ml-64 min-h-screen flex flex-col">
              <AdminHeader />
              <main className="flex-1 p-6">{children}</main>
            </div>
            <Toaster position="top-right" />
          </div>
        </ClientProviders>
      </Suspense>
    </ErrorBoundary>
  );
}
export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    console.log('Auth check:', { 
      hasSession: !!session?.user, 
      hasToken: !!token,
      userRole: session?.user?.role,
      email: session?.user?.email 
    });

    // Check both session and token
    if (!session?.user?.email && !token) {
      console.log('No authentication found');
      redirect('/login');
    }

    // Try session first
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          userRole: true,
          status: true
        }
      });

      if (user?.status === 'ACTIVE' && 
          [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(user.userRole)) {
        return <AdminLayoutContent>{children}</AdminLayoutContent>;
      }
    }

    // Try token if no valid session
    if (token) {
      const verifiedUser = await verifyAuth(token);

      if (verifiedUser.isAuthenticated && 
          verifiedUser.user?.status === 'ACTIVE' &&
          [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(verifiedUser.user.userRole)) {
        return <AdminLayoutContent>{children}</AdminLayoutContent>;
      }
    }

    console.log('Authentication failed, redirecting to login');
    redirect('/login');

  } catch (error) {
    console.error('Admin layout error:', error);
    redirect('/login');
  }
}
