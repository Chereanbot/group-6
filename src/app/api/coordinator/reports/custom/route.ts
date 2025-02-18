import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CaseStatus } from '@prisma/client';

export async function GET() {
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

    // Get all cases with their related information
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { officeId: coordinator.officeId },
          { assignedOffice: { id: coordinator.officeId } }
        ]
      },
      include: {
        client: true,
        assignedOffice: true,
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                fullName: true,
                userRole: true
              }
            }
          }
        },
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

    // Transform the data for the response
    const reports = cases.map(case_ => ({
      id: case_.id,
      clientName: case_.clientName || 'Unknown',
      clientPhone: case_.clientPhone || 'N/A',
      clientEmail: case_.client?.email || 'N/A',
      caseTitle: case_.title,
      caseCategory: case_.category,
      priority: case_.priority,
      status: case_.status,
      createdAt: case_.createdAt.toISOString(),
      resolvedAt: case_.resolvedAt?.toISOString(),
      expectedResolutionDate: case_.expectedResolutionDate?.toISOString(),
      documentCount: case_.documentCount || 0,
      assignedCoordinator: case_.assignments?.[0]?.assignedTo?.fullName || 'Unassigned',
      assignedOffice: case_.assignedOffice?.name || 'Unassigned',
      officeAddress: case_.assignedOffice?.location || 'N/A',
      billableHours: case_.totalBillableHours || 0,
      complexity: case_.complexityScore || 0,
      riskLevel: case_.riskLevel || 0
    }));

    return NextResponse.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error fetching custom reports:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch custom reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error generating custom report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate custom report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 