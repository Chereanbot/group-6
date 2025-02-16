import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Find the user with the token and verify super admin role
    const user = await prisma.user.findFirst({
      where: {
        userRole: UserRoleEnum.SUPER_ADMIN
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all offices
    const offices = await prisma.office.findMany({
      select: {
        id: true,
        name: true,
        address: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Format the response
    const formattedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.address || undefined
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