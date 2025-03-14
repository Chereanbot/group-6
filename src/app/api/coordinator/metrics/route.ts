import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum, CaseStatus, CaseCategory } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all cases for distribution
    const cases = await prisma.case.findMany({
      where: {
        assignments: {
          some: {
            assignedToId: user.id
          }
        }
      },
      select: {
        category: true
      }
    });

    // Calculate distribution manually
    const distributionMap = cases.reduce((acc, curr) => {
      acc.set(curr.category, (acc.get(curr.category) || 0) + 1);
      return acc;
    }, new Map());

    // Ensure all categories are represented
    const completeDistribution = Object.values(CaseCategory).map(category => ({
      category,
      count: distributionMap.get(category) || 0
    }));

    // Sort by count descending
    completeDistribution.sort((a, b) => b.count - a.count);

    // Calculate performance metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalCases,
      resolvedCases,
      responseTimeData
    ] = await Promise.all([
      // Total cases in last 30 days
      prisma.case.count({
        where: {
          assignments: {
            some: {
              assignedToId: user.id
            }
          },
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Resolved cases in last 30 days
      prisma.case.count({
        where: {
          assignments: {
            some: {
              assignedToId: user.id
            }
          },
          status: CaseStatus.RESOLVED,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Average response time
      prisma.case.findMany({
        where: {
          assignments: {
            some: {
              assignedToId: user.id
            }
          },
          status: CaseStatus.RESOLVED,
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    // Calculate average response time in hours
    const avgResponseTime = responseTimeData.reduce((acc, curr) => {
      const diff = curr.updatedAt.getTime() - curr.createdAt.getTime();
      return acc + (diff / (1000 * 60 * 60)); // Convert to hours
    }, 0) / (responseTimeData.length || 1);

    // Calculate success rate
    const successRate = (resolvedCases / (totalCases || 1)) * 100;

    return NextResponse.json({
      success: true,
      data: {
        caseDistribution: completeDistribution,
        performanceMetrics: {
          successRate: Math.round(successRate),
          responseTime: Math.round(avgResponseTime * 10) / 10,
          resolutionRate: Math.round((resolvedCases / (totalCases || 1)) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 