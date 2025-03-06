import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { addDays, startOfDay, endOfDay, addMinutes, format } from 'date-fns';
import { UserRoleEnum, Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cookies = headersList.get('cookie');
    
    const token = authHeader?.split(' ')[1] || 
                 cookies?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString();
    const days = parseInt(searchParams.get('days') || '7');
    const caseType = searchParams.get('caseType');
    const coordinatorId = searchParams.get('coordinatorId');

    // Get working hours (9 AM to 5 PM)
    const workingHours = {
      start: 9,
      end: 17,
      slotDuration: 30, // minutes
    };

    // Get all existing appointments within the date range
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledTime: {
          gte: startOfDay(new Date(startDate)),
          lte: endOfDay(addDays(new Date(startDate), days)),
        },
        ...(coordinatorId && { coordinatorId }),
      },
      select: {
        scheduledTime: true,
        duration: true,
        coordinatorId: true,
      },
    });

    // Get all coordinators if no specific coordinator is requested
    const coordinators = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.COORDINATOR,
        ...(coordinatorId && { id: coordinatorId }),
      },
      select: {
        id: true,
        fullName: true,
        coordinatorProfile: {
          select: {
            office: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    // Generate available slots for each day
    const availableSlots = [];
    const startDateObj = new Date(startDate);

    for (let day = 0; day < days; day++) {
      const currentDate = addDays(startDateObj, day);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      for (const coordinator of coordinators) {
        const dayStart = new Date(currentDate.setHours(workingHours.start, 0, 0, 0));
        const dayEnd = new Date(currentDate.setHours(workingHours.end, 0, 0, 0));
        let currentSlot = dayStart;

        while (currentSlot < dayEnd) {
          const slotEnd = addMinutes(currentSlot, workingHours.slotDuration);
          
          // Check if slot is available (not booked)
          const isBooked = existingAppointments.some(apt => {
            const aptStart = new Date(apt.scheduledTime);
            const aptEnd = addMinutes(aptStart, apt.duration);
            return (
              apt.coordinatorId === coordinator.id &&
              ((currentSlot >= aptStart && currentSlot < aptEnd) ||
                (slotEnd > aptStart && slotEnd <= aptEnd))
            );
          });

          if (!isBooked) {
            availableSlots.push({
              startTime: currentSlot.toISOString(),
              endTime: slotEnd.toISOString(),
              coordinator: {
                id: coordinator.id,
                name: coordinator.fullName,
                office: coordinator.coordinatorProfile?.office || null,
              },
            });
          }

          currentSlot = slotEnd;
        }
      }
    }

    // Group slots by date
    const groupedSlots = availableSlots.reduce((acc, slot) => {
      const date = format(new Date(slot.startTime), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {} as Record<string, typeof availableSlots>);

    return NextResponse.json({
      success: true,
      data: {
        slots: groupedSlots,
        coordinators,
      },
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
} 