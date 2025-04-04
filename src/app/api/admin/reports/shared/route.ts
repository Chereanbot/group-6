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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the filter parameter from the URL
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all';

    // Get all notifications with user details
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

        // For super admin, we want to show all shared reports
        // but still respect the filter parameter for organization
        switch (filter) {
          case 'shared':
            return metadata.sharedBy?.role === UserRoleEnum.COORDINATOR;
          case 'received':
            return Array.isArray(metadata.sharedWith) && 
                   metadata.sharedWith.some((user: any) => user.role === UserRoleEnum.COORDINATOR);
          default:
            return metadata.sharedBy?.role === UserRoleEnum.COORDINATOR || 
                   (Array.isArray(metadata.sharedWith) && 
                    metadata.sharedWith.some((user: any) => user.role === UserRoleEnum.COORDINATOR));
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
            id: metadata.sharedBy?.id || '',
            name: metadata.sharedBy?.name || 'Unknown User',
            role: metadata.sharedBy?.role || 'UNKNOWN',
            email: report.user?.email || ''
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
          exportOptions: metadata.exportOptions || {},
          permissions: metadata.permissions || [],
          resourceId: metadata.resourceId || ''
        };
      } catch (e) {
        console.error('Error transforming report:', e);
        return null;
      }
    }).filter(Boolean);

    // Get additional statistics
    const statistics = {
      total: transformedReports.length,
      byCoordinator: transformedReports.reduce((acc, report) => {
        const coordinatorId = report.sharedBy.id;
        acc[coordinatorId] = (acc[coordinatorId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: transformedReports.reduce((acc, report) => {
        const status = report.sharedWith[0]?.status || 'PENDING';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      reports: transformedReports,
      statistics
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const reportId = parts[parts.length - 1];

    // First get the notification to check its metadata
    const notification = await prisma.notification.findUnique({
      where: { id: reportId }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Parse metadata to verify it's a coordinator report
    const metadata = typeof notification.metadata === 'string' 
      ? JSON.parse(notification.metadata) 
      : notification.metadata;

    if (!metadata || metadata.type !== 'REPORT_SHARE' || metadata.sharedBy?.role !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Invalid report type or unauthorized" },
        { status: 403 }
      );
    }

    // Delete the notification
    await prisma.notification.delete({
      where: { id: reportId }
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

export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const reportId = parts[parts.length - 1];
    const body = await request.json();
    const { action, userId, permissions, expiresAt, status } = body;

    // Get the notification
    const notification = await prisma.notification.findUnique({
      where: { id: reportId }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Parse metadata
    const metadata = typeof notification.metadata === 'string' 
      ? JSON.parse(notification.metadata) 
      : notification.metadata;

    if (!metadata || metadata.type !== 'REPORT_SHARE' || metadata.sharedBy?.role !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Invalid report type or unauthorized" },
        { status: 403 }
      );
    }

    // Handle different update actions
    switch (action) {
      case 'UPDATE_STATUS':
        if (!userId || !status) {
          return NextResponse.json(
            { success: false, message: "Missing required fields" },
            { status: 400 }
          );
        }
        // Update user status in sharedWith array
        metadata.sharedWith = metadata.sharedWith.map((user: any) => 
          user.id === userId ? { ...user, status } : user
        );
        break;

      case 'UPDATE_PERMISSIONS':
        if (!userId || !permissions) {
          return NextResponse.json(
            { success: false, message: "Missing required fields" },
            { status: 400 }
          );
        }
        // Update user permissions in sharedWith array
        metadata.sharedWith = metadata.sharedWith.map((user: any) => 
          user.id === userId ? { ...user, permissions } : user
        );
        break;

      case 'UPDATE_EXPIRATION':
        if (!expiresAt) {
          return NextResponse.json(
            { success: false, message: "Missing expiration date" },
            { status: 400 }
          );
        }
        metadata.expiresAt = expiresAt;
        break;

      case 'REVOKE_ACCESS':
        if (!userId) {
          return NextResponse.json(
            { success: false, message: "Missing user ID" },
            { status: 400 }
          );
        }
        // Remove user from sharedWith array
        metadata.sharedWith = metadata.sharedWith.filter((user: any) => user.id !== userId);
        break;

      case 'TRACK_ACCESS':
        if (!userId) {
          return NextResponse.json(
            { success: false, message: "Missing user ID" },
            { status: 400 }
          );
        }
        // Add access tracking
        metadata.accessLog = metadata.accessLog || [];
        metadata.accessLog.push({
          userId,
          timestamp: new Date().toISOString(),
          action: 'VIEW'
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    // Update the notification with new metadata
    await prisma.notification.update({
      where: { id: reportId },
      data: {
        metadata,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error updating shared report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update shared report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 