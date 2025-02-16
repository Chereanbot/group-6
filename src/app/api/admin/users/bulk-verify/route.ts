import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userIds, verificationType } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 });
    }

    const updateData = verificationType === 'email'
      ? { emailVerified: true }
      : { phoneVerified: true };

    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    });

    // Create verification logs
    await prisma.securityLog.createMany({
      data: userIds.map(userId => ({
        userId,
        eventType: 'BULK_VERIFICATION',
        severity: 'INFO',
        status: 'SUCCESS',
        description: `Bulk ${verificationType} verification by admin`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        details: {
          verificationType,
          verifiedBy: authResult.user.id
        }
      }))
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk verification failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify users' },
      { status: 500 }
    );
  }
} 