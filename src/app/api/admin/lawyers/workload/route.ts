import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const workloadData = await prisma.lawyer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cases: {
          select: {
            id: true,
            status: true,
          },
        },
        assignments: {
          select: {
            id: true,
            status: true,
            type: true,
          },
        },
        schedules: {
          select: {
            id: true,
            status: true,
            type: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const transformedData = workloadData.map((lawyer) => ({
      id: lawyer.id,
      name: lawyer.name,
      email: lawyer.email,
      caseCount: lawyer.cases.length,
      completedCases: lawyer.cases.filter((c) => c.status === 'COMPLETED').length,
      activeAssignments: lawyer.assignments.filter((a) => a.status === 'IN_PROGRESS').length,
      completedAssignments: lawyer.assignments.filter((a) => a.status === 'COMPLETED').length,
      averageRating: lawyer.ratings.length > 0
        ? lawyer.ratings.reduce((acc, curr) => acc + curr.rating, 0) / lawyer.ratings.length
        : 0,
      utilizationRate: calculateUtilizationRate(lawyer.schedules),
      responseTime: calculateResponseTime(lawyer.assignments),
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching workload data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function calculateUtilizationRate(schedules: any[]): number {
  if (schedules.length === 0) return 0;
  const busySchedules = schedules.filter(s => s.status === 'BUSY' || s.status === 'ON_CALL');
  return (busySchedules.length / schedules.length) * 100;
}

function calculateResponseTime(assignments: any[]): number {
  if (assignments.length === 0) return 0;
  // This is a simplified calculation. You might want to adjust based on your needs
  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');
  if (completedAssignments.length === 0) return 0;
  
  return 24; // Default to 24 hours for now
} 