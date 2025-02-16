import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total counts
    const [
      totalLawyers,
      activeLawyers,
      inactiveLawyers,
      totalCases,
      pendingCases,
      completedCases
    ] = await Promise.all([
      prisma.user.count({ where: { userRole: 'LAWYER' } }),
      prisma.user.count({ where: { userRole: 'LAWYER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { userRole: 'LAWYER', status: 'INACTIVE' } }),
      prisma.case.count({ where: { lawyerId: { not: null } } }),
      prisma.case.count({ where: { lawyerId: { not: null }, status: 'ACTIVE' } }),
      prisma.case.count({ where: { lawyerId: { not: null }, status: 'COMPLETED' } })
    ]);

    // Get case distribution by type
    const caseDistribution = await prisma.case.groupBy({
      by: ['category'],
      where: {
        lawyerId: { not: null }
      },
      _count: true
    });

    // Get performance metrics
    const performances = await prisma.performance.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    // Calculate average ratings
    const lawyers = await prisma.lawyerProfile.findMany({
      include: {
        user: {
          select: {
            fullName: true
          }
        }
      }
    });

    const averageRating = lawyers.reduce((acc, lawyer) => acc + (lawyer.rating || 0), 0) / lawyers.length;

    // Get specialization distribution
    const specializationDistribution = await prisma.lawyerSpecialization.groupBy({
      by: ['specializationId'],
      _count: true,
      orderBy: {
        _count: {
          specializationId: 'desc'
        }
      },
      take: 5
    });

    // Get office distribution
    const officeDistribution = await prisma.lawyerProfile.groupBy({
      by: ['officeId'],
      _count: true
    });

    return NextResponse.json({
      data: {
        overview: {
          totalLawyers,
          activeLawyers,
          inactiveLawyers,
          totalCases,
          pendingCases,
          completedCases,
          averageRating
        },
        caseDistribution,
        performance: performances,
        specializationDistribution,
        officeDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyer statistics' },
      { status: 500 }
    );
  }
} 