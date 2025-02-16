import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRoleEnum } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // Missing prisma import

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  try {
    // Verify session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || !session.active || session.expiresAt < new Date()) {
      return new NextResponse(
        JSON.stringify({ error: 'Session expired' }),
        { status: 401 }
      );
    }

    // Check role-based access
    const path = request.nextUrl.pathname;
    const user = session.user;

    if (path.startsWith('/admin') && user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403 }
      );
    }

    if (path.startsWith('/coordinator') && user.userRole !== UserRoleEnum.COORDINATOR) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403 }
      );
    }

    if (path.startsWith('/lawyer') && user.userRole !== UserRoleEnum.LAWYER) {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 401 }
    );
  }
}