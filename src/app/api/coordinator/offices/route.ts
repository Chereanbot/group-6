import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 200 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }   

    // Get coordinator's office ID
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        user: {
          email: user.email
        },
        status: 'ACTIVE'
      },
      include: {
        user: true,
        office: true
      }
    });

    if (!coordinator) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator not found'
      }, { status: 404 });
    }

    // Get all active offices with coordinator counts
    const offices = await prisma.office.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        location: true,
        type: true,
        status: true,
        capacity: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        coordinators: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include availability info
    const formattedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.location || '',
      type: office.type,
      status: office.status,
      capacity: office.capacity || 10,
      currentCount: office.coordinators.length,
      contactEmail: office.contactEmail,
      contactPhone: office.contactPhone,
      address: office.address,
      available: (office.capacity || 10) > office.coordinators.length,
      isCurrentOffice: office.id === coordinator.officeId,
      coordinators: office.coordinators
    }));

    return NextResponse.json({
      success: true,
      data: {
        offices: formattedOffices,
        currentOfficeId: coordinator.officeId,
        currentUser: {
          id: coordinator.user.id,
          email: coordinator.user.email,
          fullName: coordinator.user.fullName
        }
      }
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch offices'
    }, { status: 500 });
  }
}