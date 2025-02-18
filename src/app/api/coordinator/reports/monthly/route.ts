import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CaseStatus } from '@prisma/client';
import { differenceInDays } from 'date-fns';

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
    const { startDate, endDate } = body;

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

    // Get all cases for the specified month
    const cases = await prisma.case.findMany({
      where: {
        AND: [
          {
            OR: [
              { officeId: coordinator.officeId },
              { assignedOffice: { id: coordinator.officeId } }
            ]
          },
          {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        ]
      },
      include: {
        client: true,
        assignedOffice: true,
        activities: true,
        assignments: {
          include: {
            assignedTo: true
          }
        },
        timeEntries: true,
        documents: true,
        notes: true
      }
    });

    // Calculate statistics
    const totalCases = cases.length;
    const newCases = cases.filter(c => 
      c.createdAt >= new Date(startDate) && c.createdAt <= new Date(endDate)
    ).length;
    const resolvedCases = cases.filter(c => 
      c.status === CaseStatus.RESOLVED && 
      c.resolvedAt && 
      c.resolvedAt >= new Date(startDate) && 
      c.resolvedAt <= new Date(endDate)
    ).length;

    // Calculate average resolution time
    const resolvedWithTimes = cases.filter(c => c.resolvedAt && c.createdAt);
    const averageResolutionTime = resolvedWithTimes.length > 0
      ? resolvedWithTimes.reduce((acc, c) => 
          acc + differenceInDays(c.resolvedAt!, c.createdAt), 0) / resolvedWithTimes.length
      : 0;

    // Calculate total billable hours and revenue
    const totalBillableHours = cases.reduce((acc, c) => acc + (c.totalBillableHours || 0), 0);
    const revenue = cases.reduce((acc, c) => acc + (c.totalBillableHours * 100), 0); // Assuming $100 per billable hour

    // Calculate status distribution
    const byStatus = {
      active: cases.filter(c => c.status === CaseStatus.ACTIVE).length,
      pending: cases.filter(c => c.status === CaseStatus.PENDING).length,
      resolved: cases.filter(c => c.status === CaseStatus.RESOLVED).length,
      cancelled: cases.filter(c => c.status === CaseStatus.CANCELLED).length,
    };

    // Calculate priority distribution
    const byPriority = {
      high: cases.filter(c => c.priority === 'HIGH').length,
      medium: cases.filter(c => c.priority === 'MEDIUM').length,
      low: cases.filter(c => c.priority === 'LOW').length,
    };

    // Get top categories
    const categoryCount = cases.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate performance metrics
    const resolutionRate = totalCases > 0 
      ? (resolvedCases / totalCases) * 100 
      : 0;

    // Calculate client satisfaction based on case complexity and resolution time
    const clientSatisfaction = cases.length > 0
      ? cases.reduce((acc, c) => {
          const timelyResolution = c.resolvedAt && c.expectedResolutionDate 
            ? c.resolvedAt <= c.expectedResolutionDate ? 1 : 0
            : 0;
          const documentQuality = c.documents.length > 0 ? 1 : 0;
          const noteQuality = c.notes.length > 0 ? 1 : 0;
          return acc + ((timelyResolution + documentQuality + noteQuality) / 3);
        }, 0) / cases.length * 100
      : 0;

    // Calculate efficiency based on resolution time, complexity, and billable hours
    const efficiency = cases.length > 0
      ? (resolvedCases / cases.length * 0.4 + // 40% weight on resolution rate
         (1 - averageResolutionTime / 30) * 0.3 + // 30% weight on resolution time (normalized to 30 days)
         (cases.reduce((acc, c) => acc + c.complexityScore, 0) / (cases.length * 5)) * 0.3) * 100 // 30% weight on complexity handling
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        month: startDate,
        totalCases,
        newCases,
        resolvedCases,
        averageResolutionTime,
        totalBillableHours,
        revenue,
        byStatus,
        byPriority,
        topCategories,
        performance: {
          resolutionRate,
          clientSatisfaction,
          efficiency
        }
      }
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate monthly report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 