import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateCaseProgress } from '@/lib/case-progress';
import { Prisma } from '@prisma/client';

export async function GET() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Please login first' },
      { status: 401 }
    );
  }

  if (userRole !== 'CLIENT') {
    return NextResponse.json(
      { error: 'Unauthorized: Only clients can access this data' },
      { status: 403 }
    );
  }

  try {
    // Fetch all cases for the client
    const cases = await prisma.case.findMany({
      where: {
        clientId: userId,
      },
      include: {
        assignedLawyer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            phone: true,
            lawyerProfile: {
              select: {
                rating: true
              }
            }
          }
        },
        timeEntries: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            description: true,
            serviceType: true,
            startTime: true,
            endTime: true,
            duration: true,
            status: true
          },
          orderBy: {
            startTime: 'desc'
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 5
        }
      }
    });

    // Transform the data to match the expected format
    const casesWithProgress = await Promise.all(
      cases.map(async (caseData) => {
        const progress = await calculateCaseProgress(caseData.id);
        const lawyer = caseData.assignedLawyer;
        
        return {
          ...caseData,
          lawyer: lawyer ? {
            id: lawyer.id,
            name: lawyer.fullName || lawyer.username,
            email: lawyer.email,
            phone: lawyer.phone,
            rating: lawyer.lawyerProfile?.rating || null
          } : null,
          progress: progress || {
            totalProgress: 0,
            completedServices: [],
            remainingServices: [],
            optionalServicesCompleted: [],
            timelineData: {
              mainBranch: { events: [], status: 'pending', progress: 0 },
              parallelBranches: [],
              mergePoints: []
            }
          }
        };
      })
    );

    // Calculate summary statistics
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'ACTIVE').length;
    const completedCases = cases.filter(c => c.status === 'RESOLVED').length;
    const pendingCases = cases.filter(c => c.status === 'PENDING').length;

    // Calculate average progress
    const averageProgress = Math.round(
      casesWithProgress.reduce((sum, c) => sum + (c.progress?.totalProgress || 0), 0) / totalCases
    );

    return NextResponse.json({
      cases: casesWithProgress,
      summary: {
        totalCases,
        activeCases,
        completedCases,
        pendingCases,
        averageProgress
      }
    });
  } catch (error) {
    console.error('Error fetching client case progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 