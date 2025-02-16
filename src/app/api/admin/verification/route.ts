import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status && status !== 'all' ? { status } : {};

    const requests = await prisma.verificationRequest.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Failed to fetch verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
} 