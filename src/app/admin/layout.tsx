import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { authOptions, verifyAuth } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Las School Dashboard | Du las',
  description: 'Admin dashboard for managing legal services',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    // Get session and token
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // If no authentication found, redirect to login
    if (!session?.user?.email && !token) {
      redirect('/auth/login?callbackUrl=/admin');
    }

    let user = null;

    // Try session first
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true,
          email: true,
          userRole: true,
          status: true,
          fullName: true
        }
      });
    }

    // If no valid session, try token
    if (!user && token) {
      const verifiedUser = await verifyAuth(token);
      if (verifiedUser.isAuthenticated && verifiedUser.user) {
        user = verifiedUser.user;
      }
    }

    // Check if user exists and has proper role
    if (!user || user.status !== 'ACTIVE' || 
        (user.userRole !== UserRoleEnum.ADMIN && user.userRole !== UserRoleEnum.SUPER_ADMIN)) {
      redirect('/auth/login?callbackUrl=/admin&error=unauthorized');
    }

    // If we get here, user is authenticated and authorized
    return (
      <AdminLayoutClient user={user}>
        {children}
      </AdminLayoutClient>
    );

  } catch (error) {
    console.error('Admin layout error:', error);
    redirect('/auth/login?callbackUrl=/admin&error=server_error');
  }
}