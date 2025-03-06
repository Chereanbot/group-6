import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = await headersList.get('authorization');
    const cookies = await headersList.get('cookie');
    
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

    // Get client's appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: payload.id
      },
      include: {
        coordinator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            coordinatorProfile: {
              select: {
                office: {
                  select: {
                    name: true,
                    address: true,
                    contactPhone: true,
                    contactEmail: true,
                    location: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        {
          scheduledTime: 'asc'
        },
        {
          status: 'asc'
        }
      ]
    });

    // Transform the appointments data for the response
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      scheduledTime: apt.scheduledTime.toISOString(),
      duration: apt.duration,
      purpose: apt.purpose,
      status: apt.status,
      notes: apt.notes,
      caseType: apt.caseType,
      venue: apt.venue,
      priority: apt.priority,
      requiredDocuments: apt.requiredDocuments,
      coordinator: {
        id: apt.coordinator.id,
        name: apt.coordinator.fullName,
        email: apt.coordinator.email,
        phone: apt.coordinator.phone,
        office: apt.coordinator.coordinatorProfile?.office ? {
          name: apt.coordinator.coordinatorProfile.office.name,
          address: apt.coordinator.coordinatorProfile.office.address,
          phone: apt.coordinator.coordinatorProfile.office.contactPhone,
          email: apt.coordinator.coordinatorProfile.office.contactEmail,
          location: apt.coordinator.coordinatorProfile.office.location
        } : null
      }
    }));

    return NextResponse.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 