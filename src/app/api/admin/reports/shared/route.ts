import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
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

    // Verify admin permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { userRole: true }
    });

    if (!user || ![UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(user.userRole)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get the filter parameter from the URL
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all';

    // Get all notifications
    const reports = await prisma.notification.findMany({
      where: {
        type: 'SYSTEM_UPDATE',
        metadata: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            userRole: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter and transform the results
    const filteredReports = reports.filter(report => {
      try {
        const metadata = typeof report.metadata === 'string' 
          ? JSON.parse(report.metadata) 
          : report.metadata;

        if (!metadata || metadata.type !== 'REPORT_SHARE') return false;

        switch (filter) {
          case 'shared':
            return metadata.sharedBy === payload.id;
          case 'received':
            return Array.isArray(metadata.sharedWith) && 
                   metadata.sharedWith.some((user: any) => user.id === payload.id);
          default:
            return metadata.sharedBy === payload.id || 
                   (Array.isArray(metadata.sharedWith) && 
                    metadata.sharedWith.some((user: any) => user.id === payload.id));
        }
      } catch (e) {
        console.error('Error parsing metadata:', e);
        return false;
      }
    });

    const transformedReports = filteredReports.map(report => {
      try {
        const metadata = typeof report.metadata === 'string' 
          ? JSON.parse(report.metadata) 
          : report.metadata;

        return {
          id: report.id,
          title: report.title || 'Untitled Report',
          description: report.message || '',
          sharedBy: {
            id: metadata.sharedBy || '',
            name: report.user?.fullName || 'Unknown User',
            role: report.user?.userRole || 'UNKNOWN'
          },
          sharedWith: Array.isArray(metadata.sharedWith) 
            ? metadata.sharedWith.map((user: any) => ({
                id: user.id || '',
                name: user.name || 'Unknown User',
                role: user.role || 'UNKNOWN',
                status: user.status || 'PENDING'
              }))
            : [],
          type: metadata.type || 'UNKNOWN',
          createdAt: report.createdAt,
          expiresAt: metadata.expiresAt || null,
          hasNotes: !!metadata.notes,
          notes: metadata.notes || '',
          exportOptions: metadata.exportOptions || {}
        };
      } catch (e) {
        console.error('Error transforming report:', e);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      reports: transformedReports
    });
  } catch (error) {
    console.error('Error fetching shared reports:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch shared reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const reportId = parts[parts.length - 1];

    // Delete the notification
    await prisma.notification.delete({
      where: {
        id: reportId,
        AND: [
          {
            OR: [
              { userId: payload.id },
              { metadata: { path: ['sharedBy'], equals: payload.id } }
            ]
          }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shared report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete shared report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 