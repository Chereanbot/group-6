import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CoordinatorStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    // Get the authorization token from header or cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all offices with coordinator counts and status
    const offices = await prisma.office.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        status: true,
        coordinators: {
          where: { status: CoordinatorStatus.ACTIVE },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format the response
    const formattedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.location,
      capacity: office.capacity,
      status: office.status,
      currentCount: office.coordinators.length
    }));

    return NextResponse.json({
      success: true,
      data: { offices: formattedOffices }
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch offices' },
      { status: 500 }
    );
  }
} 