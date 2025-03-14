import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus, Prisma } from '@prisma/client';

interface LawyerWithProfile {
  id: string;
  email: string;
  status: UserStatus;
  userRole: UserRoleEnum;
  assignedCases: Array<{
    id: string;
    status: string;
  }>;
  lawyerProfile?: {
    rating: number;
    office: {
      name: string;
    } | null;
    specializations: Array<{
      specialization: {
        name: string;
      };
    }>;
  } | null;
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

    const { isAuthenticated } = await verifyAuth(token);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all lawyers with their profiles and cases
    const lawyers = await prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        userRole: UserRoleEnum.LAWYER
      },
      select: {
        id: true,
        email: true,
        status: true,
        userRole: true,
        assignedCases: {
          where: {
            status: {
              not: 'RESOLVED'
            }
          },
          select: {
            id: true,
            status: true
          }
        },
        lawyerProfile: {
          select: {
            rating: true,
            office: {
              select: {
                name: true
              }
            },
            specializations: {
              select: {
                specialization: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    }) as LawyerWithProfile[];

    // Calculate workload statistics
    const workloads = lawyers.map(lawyer => ({
      caseLoad: lawyer.assignedCases.length,
      rating: lawyer.lawyerProfile?.rating || 0
    }));

    const totalCases = workloads.reduce((sum, { caseLoad }) => sum + caseLoad, 0);
    const averageWorkload = totalCases / lawyers.length || 0;
    const maxWorkload = Math.max(...workloads.map(w => w.caseLoad), 0);
    const minWorkload = Math.min(...workloads.map(w => w.caseLoad), 0);

    // Calculate office-wise distribution
    const officeDistribution = lawyers.reduce((acc, lawyer) => {
      const officeName = lawyer.lawyerProfile?.office?.name || 'Unassigned';
      if (!acc[officeName]) {
        acc[officeName] = {
          totalLawyers: 0,
          totalCases: 0,
          averageWorkload: 0
        };
      }
      acc[officeName].totalLawyers++;
      acc[officeName].totalCases += lawyer.assignedCases.length;
      acc[officeName].averageWorkload = acc[officeName].totalCases / acc[officeName].totalLawyers;
      return acc;
    }, {} as Record<string, { totalLawyers: number; totalCases: number; averageWorkload: number }>);

    // Calculate workload distribution
    const overloadedLawyers = workloads.filter(w => w.caseLoad > averageWorkload * 1.2).length;
    const underutilizedLawyers = workloads.filter(w => w.caseLoad < averageWorkload * 0.8).length;
    const normalWorkloadLawyers = lawyers.length - overloadedLawyers - underutilizedLawyers;

    // Calculate performance metrics
    const performanceMetrics = {
      averageRating: workloads.reduce((sum, { rating }) => sum + rating, 0) / lawyers.length || 0,
      highPerformers: workloads.filter(w => w.rating >= 4.5).length,
      needsImprovement: workloads.filter(w => w.rating < 3.5).length
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalLawyers: lawyers.length,
          totalCases,
          averageWorkload,
          maxWorkload,
          minWorkload
        },
        distribution: {
          overloadedLawyers,
          underutilizedLawyers,
          normalWorkloadLawyers
        },
        officeDistribution,
        performanceMetrics
      }
    });

  } catch (error) {
    console.error('Error fetching workload stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch workload statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 