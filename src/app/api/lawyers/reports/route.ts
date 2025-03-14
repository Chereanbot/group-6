import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus, CaseStatus, Prisma } from '@prisma/client';

interface LawyerWithRelations {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  lawyerProfile: {
    rating: number;
    office: {
      name: string;
    } | null;
    specializations: Array<{
      specialization: {
        name: string;
        category: string;
      };
    }>;
  } | null;
  assignedCases: Array<{
    id: string;
    status: CaseStatus;
    createdAt: Date;
    resolvedAt: Date | null;
    clientRating: number | null;
    category: string;
  }>;
}

export async function GET(req: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
    const office = searchParams.get('office');
    const specialization = searchParams.get('specialization');
    const performanceThreshold = parseInt(searchParams.get('performanceThreshold') || '0');

    // Get all lawyers with their cases and related data
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: UserStatus.ACTIVE,
        lawyerProfile: {
          office: office && office !== 'all' ? {
            name: office
          } : undefined,
          specializations: specialization && specialization !== 'all' ? {
            some: {
              specialization: {
                name: specialization
              }
            }
          } : undefined
        }
      },
      include: {
        lawyerProfile: {
          include: {
            office: true,
            specializations: {
              include: {
                specialization: true
              }
            }
          }
        },
        assignedCases: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    }) as unknown as LawyerWithRelations[];

    // Calculate metrics for each lawyer
    const reports = lawyers.map(lawyer => {
      const totalCases = lawyer.assignedCases.length;
      const resolvedCases = lawyer.assignedCases.filter(c => c.status === CaseStatus.RESOLVED).length;
      const successRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

      // Calculate average resolution time
      const resolutionTimes = lawyer.assignedCases
        .filter(c => c.status === CaseStatus.RESOLVED && c.resolvedAt)
        .map(c => {
          const resolvedAt = new Date(c.resolvedAt!);
          const createdAt = new Date(c.createdAt);
          return Math.ceil((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)); // days
        });
      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

      // Calculate client satisfaction from case ratings
      const ratings = lawyer.assignedCases
        .filter(c => c.clientRating !== null)
        .map(c => c.clientRating!);
      const clientSatisfaction = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      // Calculate workload score (normalized)
      const workloadScore = (totalCases / Math.max(...lawyers.map(l => l.assignedCases.length))) * 100;

      // Calculate performance score
      const performanceScore = (
        (successRate * 0.4) +
        (Math.min(clientSatisfaction * 20, 100) * 0.3) +
        (Math.min((1 - (averageResolutionTime / 30)) * 100, 100) * 0.3)
      );

      // Calculate specialization performance
      const specializationPerformance = lawyer.lawyerProfile?.specializations.map(spec => {
        const specCases = lawyer.assignedCases.filter(c => c.category === spec.specialization.category);
        const specResolvedCases = specCases.filter(c => c.status === CaseStatus.RESOLVED);
        return {
          name: spec.specialization.name,
          caseCount: specCases.length,
          successRate: specCases.length > 0 ? (specResolvedCases.length / specCases.length) * 100 : 0
        };
      }) || [];

      return {
        id: lawyer.id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        status: lawyer.status,
        metrics: {
          totalCases,
          resolvedCases,
          pendingCases: totalCases - resolvedCases,
          successRate,
          averageResolutionTime,
          clientSatisfaction,
          workloadScore,
          performanceScore
        },
        specializations: specializationPerformance
      };
    });

    // Calculate aggregate statistics
    const aggregateStats = {
      totalCases: reports.reduce((sum, r) => sum + r.metrics.totalCases, 0),
      averageResolutionTime: reports.reduce((sum, r) => sum + r.metrics.averageResolutionTime, 0) / reports.length,
      overallSuccessRate: reports.reduce((sum, r) => sum + r.metrics.successRate, 0) / reports.length,
      averageClientSatisfaction: reports.reduce((sum, r) => sum + r.metrics.clientSatisfaction, 0) / reports.length,
      topPerformers: reports.filter(r => r.metrics.performanceScore >= 90).length,
      needsImprovement: reports.filter(r => r.metrics.performanceScore < 50).length
    };

    return NextResponse.json({
      success: true,
      data: {
        reports: reports.filter(r => r.metrics.performanceScore >= performanceThreshold),
        aggregateStats
      }
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate reports',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 