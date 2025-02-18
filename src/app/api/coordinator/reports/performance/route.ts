import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CaseStatus } from '@prisma/client';
import { differenceInDays, subDays, subMonths, subQuarters, subYears } from 'date-fns';

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
    const { period } = body;

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

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        break;
      case 'year':
        startDate = subYears(now, 1);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    // Get all cases for the specified period
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
              gte: startDate,
              lte: now
            }
          }
        ]
      },
      include: {
        documents: true,
        notes: true,
        timeEntries: true,
        activities: true,
        assignments: {
          include: {
            assignedTo: true
          }
        }
      }
    });

    // Calculate case metrics
    const totalCases = cases.length;
    const resolvedCases = cases.filter(c => c.status === CaseStatus.RESOLVED).length;
    const resolvedWithTimes = cases.filter(c => c.resolvedAt && c.createdAt);
    const averageResolutionTime = resolvedWithTimes.length > 0
      ? resolvedWithTimes.reduce((acc, c) => 
          acc + differenceInDays(c.resolvedAt!, c.createdAt), 0) / resolvedWithTimes.length
      : 0;
    const complexityScore = cases.length > 0
      ? cases.reduce((acc, c) => acc + c.complexityScore, 0) / cases.length
      : 0;

    // Calculate workload metrics
    const activeCases = cases.filter(c => c.status === CaseStatus.ACTIVE).length;
    const daysInPeriod = differenceInDays(now, startDate);
    const casesPerDay = totalCases / daysInPeriod;
    const billableHours = cases.reduce((acc, c) => acc + (c.totalBillableHours || 0), 0);
    const utilizationRate = (billableHours / (daysInPeriod * 8)) * 100; // Assuming 8-hour workday

    // Calculate quality metrics
    const documentationScore = cases.length > 0
      ? (cases.filter(c => c.documents.length > 0).length / cases.length) * 100
      : 0;
    const timelinessScore = cases.length > 0
      ? (cases.filter(c => 
          c.resolvedAt && c.expectedResolutionDate && 
          c.resolvedAt <= c.expectedResolutionDate
        ).length / cases.length) * 100
      : 0;
    const accuracyScore = cases.length > 0
      ? (cases.filter(c => c.notes.length >= 2).length / cases.length) * 100
      : 0;
    const completenessScore = cases.length > 0
      ? (cases.filter(c => 
          c.documents.length > 0 && 
          c.notes.length > 0 && 
          c.activities.length > 0
        ).length / cases.length) * 100
      : 0;

    // Calculate efficiency metrics
    const resolutionRate = (resolvedCases / totalCases) * 100;
    const responseTime = cases.length > 0
      ? cases.reduce((acc, c) => {
          const firstActivity = c.activities[0];
          return acc + (firstActivity 
            ? differenceInDays(firstActivity.createdAt, c.createdAt) * 24
            : 0);
        }, 0) / cases.length
      : 0;
    const throughputRate = resolvedCases / daysInPeriod;
    const backlogRate = (activeCases / totalCases) * 100;

    // Calculate compliance metrics
    const deadlineMet = cases.length > 0
      ? (cases.filter(c => 
          c.resolvedAt && c.expectedResolutionDate && 
          c.resolvedAt <= c.expectedResolutionDate
        ).length / cases.length) * 100
      : 0;
    const procedureFollowed = cases.length > 0
      ? (cases.filter(c => 
          c.activities.length >= 3 && 
          c.notes.length >= 2
        ).length / cases.length) * 100
      : 0;
    const documentationComplete = cases.length > 0
      ? (cases.filter(c => 
          c.documents.length >= 2 && 
          c.notes.length >= 2
        ).length / cases.length) * 100
      : 0;
    const regulatoryCompliance = cases.length > 0
      ? (cases.filter(c => 
          c.documents.length > 0 && 
          c.notes.length > 0 && 
          c.activities.length > 0
        ).length / cases.length) * 100
      : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        period,
        caseMetrics: {
          totalCases,
          resolvedCases,
          averageResolutionTime,
          complexityScore
        },
        workloadMetrics: {
          activeCases,
          casesPerDay,
          billableHours,
          utilizationRate
        },
        qualityMetrics: {
          documentationScore,
          timelinessScore,
          accuracyScore,
          completenessScore
        },
        efficiencyMetrics: {
          resolutionRate,
          responseTime,
          throughputRate,
          backlogRate
        },
        complianceMetrics: {
          deadlineMet,
          procedureFollowed,
          documentationComplete,
          regulatoryCompliance
        }
      }
    });
  } catch (error) {
    console.error('Error generating performance metrics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate performance metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 