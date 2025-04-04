import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Verify authentication using the super-admin check pattern
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the current date and last month for period comparisons
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Calculate Case Resolution Metrics
    const caseMetrics = await prisma.case.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: lastMonth
        }
      }
    });

    const totalCases = caseMetrics.reduce((sum, metric) => sum + metric._count.id, 0);
    const resolvedCases = caseMetrics.find(m => m.status === 'RESOLVED')?._count.id || 0;
    const resolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

    // Calculate Response Time Metrics
    const communications = await prisma.communication.findMany({
      where: {
        createdAt: {
          gte: lastMonth
        },
        type: 'RESPONSE'
      },
      include: {
        serviceRequest: true
      }
    });

    const responseTimeHours = communications
      .filter(comm => comm.serviceRequest)
      .map(comm => {
        const responseTime = new Date(comm.createdAt).getTime() - new Date(comm.serviceRequest.updatedAt).getTime();
        return responseTime / (1000 * 60 * 60); // Convert to hours
      });

    const averageResponseTime = responseTimeHours.length > 0
      ? responseTimeHours.reduce((sum, time) => sum + time, 0) / responseTimeHours.length
      : 0;

    const responseWithin24h = responseTimeHours.length > 0
      ? (responseTimeHours.filter(time => time <= 24).length / responseTimeHours.length) * 100
      : 0;

    // Calculate Client Satisfaction Metrics
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        updatedAt: {
          gte: lastMonth
        }
      },
      select: {
        metadata: true
      }
    });

    const ratings = serviceRequests
      .map(sr => {
        const metadata = sr.metadata as { rating?: number };
        return metadata?.rating || 0;
      })
      .filter(rating => rating > 0);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    // Calculate Staff Efficiency Metrics
    const staffMembers = await prisma.user.count({
      where: {
        userRole: UserRoleEnum.LAWYER
      }
    });

    const casesPerStaff = staffMembers > 0 ? totalCases / staffMembers : 0;

    const caseHandlingTimes = await prisma.case.findMany({
      where: {
        status: 'RESOLVED',
        createdAt: {
          gte: lastMonth
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const averageHandlingTime = caseHandlingTimes.length > 0
      ? caseHandlingTimes.reduce((sum, caseItem) => {
          const handlingTime = new Date(caseItem.updatedAt).getTime() - new Date(caseItem.createdAt).getTime();
          return sum + (handlingTime / (1000 * 60 * 60)); // Convert to hours
        }, 0) / caseHandlingTimes.length
      : 0;

    // Calculate Financial Metrics
    const payments = await prisma.payment.groupBy({
      by: ['status'],
      _sum: {
        amount: true
      },
      where: {
        updatedAt: {
          gte: lastMonth
        }
      }
    });

    const revenue = payments.find(f => f.status === 'COMPLETED')?._sum.amount || 0;
    const expenses = payments.find(f => f.status === 'REFUNDED')?._sum.amount || 0;
    const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

    // Compile all metrics
    const metrics = {
      caseResolution: {
        totalCases,
        resolvedCases,
        resolutionRate
      },
      responseTime: {
        averageResponseTime,
        responseWithin24h
      },
      clientSatisfaction: {
        averageRating,
        totalReviews: ratings.length
      },
      staffEfficiency: {
        casesPerStaff,
        averageHandlingTime
      },
      financial: {
        revenue,
        expenses,
        profitMargin
      }
    };

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
} 