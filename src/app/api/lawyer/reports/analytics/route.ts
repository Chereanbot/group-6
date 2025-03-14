import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access analytics' },
        { status: 403 }
      );
    }

    // Get case statistics
    const [totalCases, activeCases, resolvedCases, pendingCases] = await Promise.all([
      prisma.case.count({ where: { lawyerId: userId } }),
      prisma.case.count({ where: { lawyerId: userId, status: 'ACTIVE' } }),
      prisma.case.count({ where: { lawyerId: userId, status: 'RESOLVED' } }),
      prisma.case.count({ where: { lawyerId: userId, status: 'PENDING' } })
    ]);

    // Get case categories distribution
    const caseCategories = await prisma.case.groupBy({
      by: ['category'],
      where: { lawyerId: userId },
      _count: true,
    });

    // Get daily case activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivities = await prisma.caseActivity.groupBy({
      by: ['createdAt'],
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
    });

    // Get case complexity distribution
    const caseComplexity = await prisma.case.groupBy({
      by: ['complexityScore'],
      where: { lawyerId: userId },
      _count: true,
    });

    // Get hourly activity distribution
    const hourlyActivity = await prisma.caseActivity.groupBy({
      by: ['createdAt'],
      where: { userId: userId },
      _count: true,
    });

    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyActivity.filter(activity => 
        new Date(activity.createdAt).getHours() === hour
      ).reduce((sum, curr) => sum + curr._count, 0)
    }));

    // Get case outcome analysis
    const caseOutcomes = await prisma.case.groupBy({
      by: ['status'],
      where: { lawyerId: userId },
      _count: true,
    });

    // Get monthly case trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await prisma.case.groupBy({
      by: ['createdAt'],
      where: {
        lawyerId: userId,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: true,
    });

    // Get performance metrics
    const performanceMetrics = await prisma.workloadMetrics.findFirst({
      where: { lawyerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get client satisfaction
    const ratings = await prisma.rating.findMany({
      where: { userId: userId },
      select: { rating: true },
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

    // Get revenue analytics
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        lawyerId: userId,
        billable: true,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        duration: true,
        rate: true,
        createdAt: true,
      },
    });

    // Calculate monthly revenue
    const monthlyRevenue = timeEntries.reduce((acc, entry) => {
      const month = new Date(entry.createdAt).getMonth();
      const revenue = (entry.duration / 3600) * entry.rate;
      acc[month] = (acc[month] || 0) + revenue;
      return acc;
    }, {} as Record<number, number>);

    // Get recent case activities
    const recentActivities = await prisma.caseActivity.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        case: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    // Calculate efficiency metrics
    const resolvedCasesWithDuration = await prisma.case.findMany({
      where: {
        lawyerId: userId,
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    const avgResolutionTime = resolvedCasesWithDuration.length > 0
      ? resolvedCasesWithDuration.reduce((acc, curr) => {
          return acc + (curr.resolvedAt!.getTime() - curr.createdAt.getTime());
        }, 0) / resolvedCasesWithDuration.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return NextResponse.json({
      caseMetrics: {
        total: totalCases,
        active: activeCases,
        resolved: resolvedCases,
        pending: pendingCases,
        resolutionRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
      },
      categoryDistribution: caseCategories.map(cat => ({
        category: cat.category,
        count: cat._count,
        percentage: (cat._count / totalCases) * 100,
      })),
      monthlyTrends: monthlyTrends.map(trend => ({
        date: trend.createdAt,
        count: trend._count,
      })),
      performance: {
        ...performanceMetrics,
        averageRating: parseFloat(avgRating.toFixed(1)),
        averageResolutionTime: Math.round(avgResolutionTime),
        successRate: totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0,
      },
      revenue: {
        monthly: monthlyRevenue,
        total: Object.values(monthlyRevenue).reduce((a, b) => a + b, 0),
        average: Object.values(monthlyRevenue).length > 0
          ? Object.values(monthlyRevenue).reduce((a, b) => a + b, 0) / Object.values(monthlyRevenue).length
          : 0,
      },
      activities: recentActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        caseName: activity.case.title,
        category: activity.case.category,
        date: activity.createdAt,
      })),
      // New data points
      trafficAnalysis: {
        hourlyDistribution,
        dailyActivities: dailyActivities.map(activity => ({
          date: activity.createdAt,
          count: activity._count,
        })),
      },
      caseAnalytics: {
        complexity: caseComplexity.map(comp => ({
          level: comp.complexityScore,
          count: comp._count,
        })),
        outcomes: caseOutcomes.map(outcome => ({
          status: outcome.status,
          count: outcome._count,
        })),
      },
    });
  } catch (error) {
    console.error("[LAWYER_ANALYTICS_REPORT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 