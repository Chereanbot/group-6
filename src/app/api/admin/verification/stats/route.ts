import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [pending, approved, rejected, total] = await Promise.all([
      prisma.verificationRequest.count({ where: { status: 'pending' } }),
      prisma.verificationRequest.count({ where: { status: 'approved' } }),
      prisma.verificationRequest.count({ where: { status: 'rejected' } }),
      prisma.verificationRequest.count(),
    ]);

    return NextResponse.json({
      pending,
      approved,
      rejected,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch verification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification stats' },
      { status: 500 }
    );
  }
} 