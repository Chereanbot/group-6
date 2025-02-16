import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const eventType = url.searchParams.get('eventType');
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build where clause based on filters
    const where: any = {};
    
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.securityLog.count({ where });

    // Get paginated results
    const logs = await prisma.securityLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
} 