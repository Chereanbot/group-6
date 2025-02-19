import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Parser } from '@json2csv/plainjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the notification
    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        type: 'SYSTEM_UPDATE',
        metadata: {
          path: ['type'],
          equals: 'REPORT_SHARE'
        },
        OR: [
          { userId: payload.id },
          { metadata: { path: ['sharedWith'], array_contains: [{ id: payload.id }] } }
        ]
      }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Get the export options from metadata
    const exportOptions = notification.metadata.exportOptions;

    // Fetch the actual report data based on export options
    const reportData = await generateReportData(exportOptions);

    // Convert to CSV
    const parser = new Parser({
      fields: Object.keys(reportData[0] || {})
    });
    const csv = parser.parse(reportData);

    // Update the notification status for this user
    await prisma.notification.update({
      where: { id: params.id },
      data: {
        metadata: {
          ...notification.metadata,
          sharedWith: notification.metadata.sharedWith.map((user: any) => 
            user.id === payload.id 
              ? { ...user, status: 'DOWNLOADED' }
              : user
          )
        }
      }
    });

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=report-${params.id}.csv`
      }
    });
  } catch (error) {
    console.error('Error downloading shared report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to download report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateReportData(options: any) {
  // Get coordinator's cases based on options
  const cases = await prisma.case.findMany({
    where: {
      ...(options.dateRange?.start && options.dateRange?.end ? {
        createdAt: {
          gte: new Date(options.dateRange.start),
          lte: new Date(options.dateRange.end)
        }
      } : {}),
      ...(options.filters?.status?.length ? {
        status: { in: options.filters.status }
      } : {}),
      ...(options.filters?.priority?.length ? {
        priority: { in: options.filters.priority }
      } : {}),
      ...(options.filters?.category?.length ? {
        category: { in: options.filters.category }
      } : {})
    },
    include: {
      client: true,
      assignedOffice: true,
      assignments: {
        include: {
          assignedTo: {
            select: {
              fullName: true,
              userRole: true
            }
          }
        }
      }
    }
  });

  // Transform cases based on selected columns
  return cases.map(case_ => {
    const row: any = {};
    options.columns?.forEach((column: string) => {
      switch (column) {
        case 'clientName':
          row[column] = case_.clientName || 'Unknown';
          break;
        case 'caseTitle':
          row[column] = case_.title;
          break;
        case 'status':
          row[column] = case_.status;
          break;
        case 'priority':
          row[column] = case_.priority;
          break;
        case 'category':
          row[column] = case_.category;
          break;
        case 'createdAt':
          row[column] = case_.createdAt.toISOString();
          break;
        case 'resolvedAt':
          row[column] = case_.resolvedAt?.toISOString() || 'N/A';
          break;
        case 'assignedCoordinator':
          row[column] = case_.assignments?.[0]?.assignedTo?.fullName || 'Unassigned';
          break;
        case 'billableHours':
          row[column] = case_.totalBillableHours || 0;
          break;
        case 'documentCount':
          row[column] = case_.documentCount || 0;
          break;
        default:
          row[column] = 'N/A';
      }
    });
    return row;
  });
} 