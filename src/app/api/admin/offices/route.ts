import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

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

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all offices with coordinator count
    const offices = await prisma.office.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        capacity: true,
        status: true,
        coordinators: {
          where: {
            status: {
              not: 'INACTIVE'
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format the response
    const formattedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.address || undefined,
      capacity: office.capacity,
      currentCount: office.coordinators.length,
      status: office.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        offices: formattedOffices
      }
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch offices'
      },
      { status: 500 }
    );
  }
} 