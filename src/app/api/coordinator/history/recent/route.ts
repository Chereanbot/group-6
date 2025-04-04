import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ObjectId } from 'mongodb';
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('search');

    // Get coordinator profile
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: user.id },
      include: {
        office: true,
        history: {
          orderBy: {
            changedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Build query conditions
    const where: any = {
      coordinatorId: coordinator.id,
    };

    if (action) {
      where.action = action;
    }

    if (startDate && endDate) {
      where.changedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (searchTerm) {
      where.OR = [
        { changeDetails: { contains: searchTerm, mode: 'insensitive' } },
        { 'client.fullName': { contains: searchTerm, mode: 'insensitive' } },
        { 'case.title': { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.coordinatorHistory.count({ where });

    // Get paginated history entries
    const history = await prisma.coordinatorHistory.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        case: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        office: {
          select: {
            id: true,
            name: true,
          },
        },
        document: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        appointment: {
          select: {
            id: true,
            scheduledTime: true,
          },
        },
        serviceRequest: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        coordinator: {
          id: coordinator.id,
          type: coordinator.type,
          officeId: coordinator.officeId,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching coordinator history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}