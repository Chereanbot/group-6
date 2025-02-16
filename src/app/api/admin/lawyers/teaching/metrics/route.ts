import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lawyerId = searchParams.get('lawyerId');

    const teachingData = await prisma.lawyer.findMany({
      where: {
        ...(lawyerId && { id: lawyerId }),
        teachingSchedules: {
          some: {},
        },
      },
      include: {
        teachingSchedules: {
          include: {
            course: true,
          },
        },
      },
    });

    const transformedData = teachingData.map((lawyer) => ({
      id: lawyer.id,
      lawyerId: lawyer.id,
      lawyer: {
        name: lawyer.name,
        email: lawyer.email,
      },
      weeklySchedule: lawyer.teachingSchedules.map((schedule) => ({
        course: schedule.course.name,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        creditHours: schedule.course.creditHours,
      })),
      teachingHours: {
        weeklyHours: calculateWeeklyHours(lawyer.teachingSchedules),
        monthlyHours: calculateMonthlyHours(lawyer.teachingSchedules),
        yearlyHours: calculateYearlyHours(lawyer.teachingSchedules),
      },
      creditHourDistribution: {
        weeklyCredits: calculateWeeklyCredits(lawyer.teachingSchedules),
        monthlyCredits: calculateMonthlyCredits(lawyer.teachingSchedules),
        yearlyCredits: calculateYearlyCredits(lawyer.teachingSchedules),
      },
      classMetrics: {
        totalClasses: lawyer.teachingSchedules.length,
        completedClasses: lawyer.teachingSchedules.filter(s => 
          new Date(s.endTime) < new Date()
        ).length,
        upcomingClasses: lawyer.teachingSchedules.filter(s => 
          new Date(s.startTime) > new Date()
        ).length,
        averageAttendance: calculateAverageAttendance(lawyer.teachingSchedules),
      },
      teachingTrends: calculateTeachingTrends(lawyer.teachingSchedules),
      createdAt: lawyer.createdAt,
      updatedAt: lawyer.updatedAt,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching teaching metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function calculateWeeklyHours(schedules: any[]): number {
  return schedules.reduce((total, schedule) => {
    const duration = new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime();
    return total + (duration / (1000 * 60 * 60)); // Convert to hours
  }, 0);
}

function calculateMonthlyHours(schedules: any[]): number {
  return calculateWeeklyHours(schedules) * 4; // Approximate
}

function calculateYearlyHours(schedules: any[]): number {
  return calculateWeeklyHours(schedules) * 52; // Approximate
}

function calculateWeeklyCredits(schedules: any[]): number {
  return schedules.reduce((total, schedule) => total + schedule.course.creditHours, 0);
}

function calculateMonthlyCredits(schedules: any[]): number {
  return calculateWeeklyCredits(schedules) * 4; // Approximate
}

function calculateYearlyCredits(schedules: any[]): number {
  return calculateWeeklyCredits(schedules) * 52; // Approximate
}

function calculateAverageAttendance(schedules: any[]): number {
  if (schedules.length === 0) return 0;
  // This is a placeholder. You would need to implement actual attendance tracking
  return 85; // Default to 85%
}

function calculateTeachingTrends(schedules: any[]): any[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    averageHours: Math.round(Math.random() * 10 + 20), // Placeholder data
    averageCredits: Math.round(Math.random() * 3 + 2), // Placeholder data
    totalClasses: Math.round(Math.random() * 5 + 10), // Placeholder data
  }));
} 