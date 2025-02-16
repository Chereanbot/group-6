import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lawyerId = searchParams.get('lawyerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      lawyerId: { not: null }
    };

    if (lawyerId) {
      where.lawyerId = lawyerId;
    }

    if (startDate) {
      where.start = {
        ...where.start,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      where.end = {
        ...where.end,
        lte: new Date(endDate)
      };
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        start: true,
        end: true,
        description: true,
        location: true,
        status: true,
        lawyerId: true,
        lawyer: {
          select: {
            fullName: true,
            email: true
          }
        },
        case: {
          select: {
            id: true,
            title: true
          }
        },
        participants: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            role: true,
            status: true
          }
        }
      },
      orderBy: {
        start: 'asc'
      }
    });

    return NextResponse.json({
      data: events,
      success: true,
      message: 'Events fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching lawyer events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 