import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id') || '';
    const userRole = headersList.get('x-user-role') || '';

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access activity data' },
        { status: 403 }
      );
    }

    // Get the last 30 days of activities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily activity counts
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

    // Get hourly distribution
    const hourlyActivity = await prisma.caseActivity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
      },
    });

    // Calculate hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyActivity.filter(activity => 
        new Date(activity.createdAt).getHours() === hour
      ).length
    }));

    // Get activity types distribution
    const activityTypes = await prisma.caseActivity.groupBy({
      by: ['type'],
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
    });

    // Get case-wise activity distribution
    const caseActivities = await prisma.caseActivity.groupBy({
      by: ['caseId'],
      where: {
        userId: userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
    });

    // Get case details for the activities
    const caseDetails = await prisma.case.findMany({
      where: {
        id: {
          in: caseActivities.map(ca => ca.caseId)
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
      },
    });

    // Get recent activities with case details
    const recentActivities = await prisma.caseActivity.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        case: {
          select: {
            title: true,
            category: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      dailyTrends: dailyActivities.map(activity => ({
        date: activity.createdAt,
        count: activity._count,
      })),
      hourlyDistribution,
      activityTypes: activityTypes.map(type => ({
        type: type.type,
        count: type._count,
      })),
      caseDistribution: caseActivities.map(ca => {
        const caseInfo = caseDetails.find(c => c.id === ca.caseId);
        return {
          caseId: ca.caseId,
          title: caseInfo?.title || 'Unknown Case',
          category: caseInfo?.category || 'N/A',
          status: caseInfo?.status || 'N/A',
          activityCount: ca._count,
        };
      }),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        caseName: activity.case.title,
        caseCategory: activity.case.category,
        caseStatus: activity.case.status,
        date: activity.createdAt,
      })),
      summary: {
        totalActivities: dailyActivities.reduce((sum, day) => sum + day._count, 0),
        averageDaily: Math.round(dailyActivities.reduce((sum, day) => sum + day._count, 0) / dailyActivities.length),
        mostActiveHour: hourlyDistribution.reduce((max, curr) => 
          curr.count > max.count ? curr : max
        , { hour: 0, count: 0 }).hour,
        mostActiveCase: caseActivities.reduce((max, curr) => 
          curr._count > max.count ? { id: curr.caseId, count: curr._count } : max
        , { id: '', count: 0 }),
      },
    });
  } catch (error) {
    console.error("[CASE_ACTIVITY_REPORT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 