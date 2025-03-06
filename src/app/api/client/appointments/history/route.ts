import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Prisma, Appointment, User, Office } from '@prisma/client';

type AppointmentWithRelations = Appointment & {
  coordinator: User & {
    coordinatorProfile: {
      office: Office | null;
    } | null;
  };
};

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // Build filter conditions
    const where: Prisma.AppointmentWhereInput = {
      clientId: payload.id,
      ...(status && { status }),
      ...(startDate && endDate && {
        scheduledTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
      ...(search && {
        OR: [
          { purpose: { contains: search, mode: 'insensitive' } },
          { caseType: { contains: search, mode: 'insensitive' } },
          { venue: { contains: search, mode: 'insensitive' } },
          {
            coordinator: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    // Get total count for pagination
    const total = await prisma.appointment.count({ where });

    // Define the include type
    const include = {
      coordinator: {
        include: {
          coordinatorProfile: {
            include: {
              office: true
            }
          }
        }
      }
    } satisfies Prisma.AppointmentInclude;

    // Get appointments with pagination
    const appointments = await prisma.appointment.findMany({
      where,
      include,
      orderBy: [
        { scheduledTime: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    }) as AppointmentWithRelations[];

    // Transform the appointments data with proper typing
    const formattedAppointments = appointments.map(apt => {
      const office = apt.coordinator.coordinatorProfile?.office;

      return {
        id: apt.id,
        scheduledTime: apt.scheduledTime.toISOString(),
        duration: apt.duration,
        purpose: apt.purpose,
        status: apt.status,
        notes: apt.notes || '',
        caseType: apt.caseType,
        venue: apt.venue,
        priority: apt.priority,
        requiredDocuments: apt.requiredDocuments,
        createdAt: apt.createdAt.toISOString(),
        updatedAt: apt.updatedAt.toISOString(),
        coordinator: {
          id: apt.coordinator.id,
          name: apt.coordinator.fullName,
          email: apt.coordinator.email,
          phone: apt.coordinator.phone,
          office: office ? {
            name: office.name,
            address: office.address,
            phone: office.contactPhone,
            email: office.contactEmail,
            location: office.location
          } : null
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointment history' },
      { status: 500 }
    );
  }
} 