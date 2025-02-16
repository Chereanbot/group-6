import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { emailVerified: false },
          { phoneVerified: false }
        ]
      },
      select: {
        id: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch pending verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
} 