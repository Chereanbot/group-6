import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sharedWithIds, permissions, expiresAt, notes, description, exportOptions } = body;

    // Generate a unique ID for this report share
    const reportShareId = new Date().getTime().toString();

    // Create notifications for shared users
    const notificationPromises = sharedWithIds.map(userId =>
      prisma.notification.create({
        data: {
          userId,
          title: 'Report Shared',
          message: `A new report has been shared with you${description ? `: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}` : ''}`,
          type: 'SYSTEM_UPDATE',
          metadata: {
            type: 'REPORT_SHARE',
            resourceId: reportShareId,
            sharedBy: payload.id,
            description,
            hasNotes: !!notes,
            notes,
            exportOptions
          }
        }
      })
    );

    await Promise.all(notificationPromises);

    return NextResponse.json({
      success: true,
      message: 'Report shared successfully',
      resourceId: reportShareId
    });
  } catch (error) {
    console.error('Error sharing report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to share report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 