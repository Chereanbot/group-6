import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Verify authentication and check coordinator role
    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can search clients" },
        { status: 403 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findFirst({
      where: { userId: user.id },
      select: { officeId: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator profile not found' },
        { status: 404 }
      );
    }

    // Get search params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type'); // 'name' or 'phone'

    if (!query || !type) {
      return NextResponse.json(
        { success: false, message: 'Search query and type are required' },
        { status: 400 }
      );
    }

    // Search clients based on name or phone
    const clients = await prisma.user.findMany({
      where: {
        AND: [
          {
            userRole: UserRoleEnum.CLIENT,
            clientCases: {
              some: {
                OR: [
                  { officeId: coordinator.officeId },
                  { officeId: null }
                ]
              }
            }
          },
          type === 'name' 
            ? { fullName: { contains: query, mode: 'insensitive' } }
            : { phone: { contains: query } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        clientCases: {
          where: {
            status: {
              in: ['ACTIVE', 'PENDING']
            }
          },
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    // Transform the response to match the expected Client interface
    const transformedClients = clients.map(client => ({
      ...client,
      cases: client.clientCases
    }));

    return NextResponse.json({
      success: true,
      data: transformedClients
    });

  } catch (error) {
    console.error('Error searching clients:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 