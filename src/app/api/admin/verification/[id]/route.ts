import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action } = await request.json();
    const { id } = params;

    const verificationRequest = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedById: authResult.user.id,
      },
    });

    // If approved, update user's verification status
    if (action === 'approved') {
      await prisma.user.update({
        where: { id: verificationRequest.userId },
        data: {
          emailVerified: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update verification request:', error);
    return NextResponse.json(
      { error: 'Failed to update verification request' },
      { status: 500 }
    );
  }
} 