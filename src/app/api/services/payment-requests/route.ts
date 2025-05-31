import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, RequestStatus } from '@prisma/client';

// Helper function to verify admin authorization
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated) {
      return { error: 'Unauthorized', status: 401 };
    }

    if (authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return { error: 'Unauthorized access', status: 403 };
    }

    return { authResult };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Unauthorized', status: 401 };
  }
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  metadata: {
    price: number;
    [key: string]: any;
  };
  submittedAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export async function GET(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the where clause
    const whereClause: any = {
      paymentStatus: { not: null }
    };

    if (status && status !== 'all') {
      whereClause.status = status as RequestStatus;
    }

    if (search) {
      whereClause.OR = [
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (startDate && endDate) {
      whereClause.submittedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Fetch requests with optimized query
    const [requests, totalCount] = await Promise.all([
      prisma.serviceRequest.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              clientProfile: {
                select: {
                  region: true,
                  zone: true,
                  wereda: true,
                  kebele: true
                }
              }
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 50 // Limit results for better performance
      }),
      prisma.serviceRequest.count({
        where: whereClause
      })
    ]);

    // Calculate summary statistics
    const summary = {
      total: totalCount,
      totalAmount: requests.reduce((sum, req) => sum + ((req.metadata as any)?.price || 0), 0),
      pending: requests.filter(req => req.status === RequestStatus.PENDING).length,
      completed: requests.filter(req => req.status === RequestStatus.COMPLETED).length,
      failed: requests.filter(req => req.status === RequestStatus.REJECTED).length
    };

    // Transform the response
    const transformedRequests = requests.map(req => ({
      ...req,
      amount: (req.metadata as any)?.price || 0,
      service: {
        name: req.title,
        description: req.description
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: transformedRequests,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching payment requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch payment requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const data = await req.json();
    const { id, status, notes } = data;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: status as RequestStatus,
        notes,
        updatedAt: status === RequestStatus.COMPLETED ? new Date() : undefined
      },
      include: {
        client: {
          select: {
            email: true,
            fullName: true
          }
        }
      }
    });

    // Transform the response
    const transformedRequest = {
      ...updatedRequest,
      amount: (updatedRequest.metadata as any)?.price || 0,
      service: {
        name: updatedRequest.title,
        description: updatedRequest.description
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedRequest
    });

  } catch (error) {
    console.error('Error updating payment request:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update payment request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 