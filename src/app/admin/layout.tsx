import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { authOptions, verifyAuth } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Du las',
  description: 'Admin dashboard for managing legal services',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // Check both session and token
    if (!session?.user?.email && !token) {
      throw new Error('No authentication found');
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
          (user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN)) {
        return <AdminLayoutClient>{children}</AdminLayoutClient>;
      }
    }

    // Try token if no valid session
    if (token) {
      const verifiedUser = await verifyAuth(token);

      if (verifiedUser.isAuthenticated && 
          verifiedUser.user?.status === 'ACTIVE' &&
          (verifiedUser.user.userRole === UserRoleEnum.ADMIN || verifiedUser.user.userRole === UserRoleEnum.SUPER_ADMIN)) {
        return <AdminLayoutClient>{children}</AdminLayoutClient>;
      }
    }

    throw new Error('Authentication failed');

  } catch (error) {
    console.error('Admin layout error:', error);
    throw error; // Let the error boundary handle it
  }
}