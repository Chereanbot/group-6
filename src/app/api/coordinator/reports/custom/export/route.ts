import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Parser } from '@json2csv/plainjs';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization') || '';
    const cookieHeader = headersList.get('cookie') || '';
    
    const token = authHeader.split(' ')[1] || 
                 cookieHeader.split('; ')
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
    const { filters, columns } = body;

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, message: 'Coordinator or office not found' },
        { status: 404 }
      );
    }

    // Build the where clause based on filters
    const where: any = {
      OR: [
        { officeId: coordinator.officeId },
        { assignedOffice: { id: coordinator.officeId } }
      ]
    };

    if (filters.dateRange.start && filters.dateRange.end) {
      where.createdAt = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end)
      };
    }

    if (filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.category.length > 0) {
      where.category = { in: filters.category };
    }

    // Get filtered cases
    const cases = await prisma.case.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data based on selected columns
    const reports = cases.map(case_ => {
      const report: any = {};
      columns.forEach((column: string) => {
        switch (column) {
          case 'clientName':
            report[column] = case_.clientName || 'Unknown';
            break;
          case 'caseTitle':
            report[column] = case_.title;
            break;
          case 'status':
            report[column] = case_.status;
            break;
          case 'priority':
            report[column] = case_.priority;
            break;
          case 'category':
            report[column] = case_.category;
            break;
          case 'createdAt':
            report[column] = case_.createdAt.toISOString();
            break;
          case 'resolvedAt':
            report[column] = case_.resolvedAt?.toISOString() || 'N/A';
            break;
          case 'assignedCoordinator':
            report[column] = case_.assignments?.[0]?.assignedTo?.fullName || 'Unassigned';
            break;
          case 'billableHours':
            report[column] = case_.totalBillableHours || 0;
            break;
          case 'documentCount':
            report[column] = case_.documentCount || 0;
            break;
          default:
            report[column] = 'N/A';
        }
      });
      return report;
    });

    // Convert to CSV
    const parser = new Parser({
      fields: columns.map(column => ({
        label: column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1'),
        value: column
      }))
    });
    const csv = parser.parse(reports);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=custom-report-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error('Error exporting custom report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export custom report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 