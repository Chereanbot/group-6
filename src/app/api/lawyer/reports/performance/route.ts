import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
            { error: 'Unauthorized: Only lawyers can access messages' },
            { status: 403 }
          );
        }

    // Get lawyer's cases
    const cases = await prisma.case.count({
      where: {
        lawyerId: userId,
      },
    });

    // Get completed cases
    const completedCases = await prisma.case.count({
      where: {
        lawyerId: userId,
        status: "RESOLVED",
      },
    });

    // Get average case duration
    const allCases = await prisma.case.findMany({
      where: {
        lawyerId: userId,
        resolvedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    const avgDuration = allCases.length > 0
      ? allCases.reduce((acc, curr) => {
          const duration = curr.resolvedAt!.getTime() - curr.createdAt.getTime();
          return acc + duration;
        }, 0) / allCases.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get lawyer's ratings
    const ratings = await prisma.rating.findMany({
      where: {
        userId: userId,
      },
      select: {
        rating: true,
      },
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

    // Get recent activities
    const recentActivities = await prisma.caseActivity.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        case: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get workload metrics
    const workloadMetrics = await prisma.workloadMetrics.findFirst({
      where: {
        lawyerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get time entries for billing
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        lawyerId: userId,
        billable: true,
      },
      select: {
        duration: true,
        rate: true,
      },
    });

    const totalBillableHours = timeEntries.reduce((acc, curr) => acc + curr.duration, 0) / 3600; // Convert seconds to hours
    const totalBillableAmount = timeEntries.reduce((acc, curr) => acc + (curr.duration / 3600) * curr.rate, 0);

    return NextResponse.json({
      overview: {
        totalCases: cases,
        completedCases,
        successRate: cases > 0 ? (completedCases / cases) * 100 : 0,
        averageDuration: Math.round(avgDuration),
        averageRating: avgRating.toFixed(1),
      },
      billing: {
        totalBillableHours: Math.round(totalBillableHours),
        totalBillableAmount: Math.round(totalBillableAmount),
        averageHourlyRate: totalBillableHours > 0 ? Math.round(totalBillableAmount / totalBillableHours) : 0,
      },
      workload: workloadMetrics || {
        caseCount: 0,
        utilizationRate: 0,
        responseTime: 0,
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        caseName: activity.case.title,
        date: activity.createdAt,
      })),
    });
  } catch (error) {
    console.error("[LAWYER_PERFORMANCE_REPORT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}