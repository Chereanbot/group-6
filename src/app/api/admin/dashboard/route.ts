import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, CaseCategory, CaseStatus } from '@prisma/client';

type CaseStats = [
  number,
  number,
  Array<{
    category: CaseCategory;
    count: number;
  }>
];

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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optimize queries by combining related data
    const [
      userStats,
      caseStats,
      resourceStats,
      documentStats,
      recentActivities
    ] = await Promise.all([
      // User stats with role counts
      prisma.$transaction([
        prisma.user.count(),
        prisma.user.count({ where: { userRole: UserRoleEnum.LAWYER } }),
        prisma.coordinator.count()
      ]),
      // Case stats with separate queries
      prisma.$transaction<CaseStats>(async (tx) => {
        const total = await tx.case.count();
        const completed = await tx.case.count({
          where: { status: CaseStatus.RESOLVED }
        });
        
        // Get case distribution
        const categories = await Promise.all(
          Object.values(CaseCategory).map(async (category) => {
            const count = await tx.case.count({
              where: { category }
            });
            return { category, count };
          })
        );
        
        return [total, completed, categories];
      }),
      // Resource stats
      prisma.resource.groupBy({
        by: ['status'],
        _count: {
          _all: true
        }
      }),
      // Document stats
      prisma.document.groupBy({
        by: ['status'],
        _count: {
          _all: true
        }
      }),
      // Recent activities
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              userRole: true
            }
          }
        }
      })
    ]);

    const [totalUsers, lawyers, coordinators] = userStats;
    const [totalCases, completedCases, caseCategories] = caseStats;

    // Calculate derived statistics
    const resources = {
      total: resourceStats.reduce((acc, r) => acc + r._count._all, 0),
      available: resourceStats.find(r => r.status === 'AVAILABLE')?._count._all || 0,
      inUse: resourceStats.find(r => r.status === 'IN_USE')?._count._all || 0,
      maintenance: resourceStats.find(r => r.status === 'MAINTENANCE')?._count._all || 0
    };

    const documents = {
      total: documentStats.reduce((acc, d) => acc + d._count._all, 0),
      pending: documentStats.find(d => d.status === 'PENDING')?._count._all || 0,
      verified: documentStats.find(d => d.status === 'APPROVED')?._count._all || 0,
      rejected: documentStats.find(d => d.status === 'REJECTED')?._count._all || 0
    };

    // Format activities
    const activities = recentActivities.map(activity => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      timestamp: activity.createdAt,
      user: {
        id: activity.user.id,
        name: activity.user.fullName,
        role: activity.user.userRole
      }
    }));

    const activeCases = totalCases - completedCases;
    const successRate = totalCases > 0 ? (completedCases / totalCases) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: totalUsers,
            new: Math.floor(totalUsers * 0.1), // Estimate of new users
            lawyers,
            coordinators
          },
          cases: {
            total: totalCases,
            active: activeCases,
            completed: completedCases,
            pending: Math.floor(activeCases * 0.3) // Estimate of pending cases
          },
          services: {
            total: totalCases,
            active: activeCases,
            completed: completedCases,
            pending: Math.floor(activeCases * 0.3),
            revenue: 50000 // Placeholder
          },
          performance: {
            successRate,
            avgResolutionTime: 14,
            clientSatisfaction: 85
          },
          resources,
          documents,
          workload: {
            average: lawyers > 0 ? Math.floor(activeCases / lawyers) : 0,
            highPriority: Math.floor(activeCases * 0.2),
            overdue: Math.floor(activeCases * 0.1),
            upcoming: Math.floor(activeCases * 0.3)
          },
          caseDistribution: caseCategories.map(({ category, count }) => ({
            category,
            count
          })),
          resourceUtilization: [
            { resource: 'Lawyers', utilization: totalUsers > 0 ? (lawyers / totalUsers) * 100 : 0 },
            { resource: 'Coordinators', utilization: totalUsers > 0 ? (coordinators / totalUsers) * 100 : 0 },
            { resource: 'Office Space', utilization: resources.total > 0 ? (resources.inUse / resources.total) * 100 : 0 }
          ],
          revenueTrends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: [30000, 35000, 40000, 45000, 48000, 50000]
            }]
          }
        },
        activities
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 