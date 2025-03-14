import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, RequestStatus } from '@prisma/client';

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const requests = await prisma.serviceRequest.findMany({
      where: {
        paymentStatus: { not: null },
        ...(status && status !== 'all' ? { status: status as RequestStatus } : {}),
        ...(search ? {
          OR: [
            { client: { fullName: { contains: search, mode: 'insensitive' } } },
            { client: { email: { contains: search, mode: 'insensitive' } } },
            { id: { contains: search, mode: 'insensitive' } }
          ]
        } : {}),
        ...(startDate && endDate ? {
          submittedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    }) as unknown as ServiceRequest[];

    // Calculate summary statistics
    const summary = {
      total: requests.length,
      totalAmount: requests.reduce((sum, req) => sum + (req.metadata?.price || 0), 0),
      pending: requests.filter(req => req.status === RequestStatus.PENDING).length,
      completed: requests.filter(req => req.status === RequestStatus.COMPLETED).length,
      failed: requests.filter(req => req.status === RequestStatus.REJECTED).length
    };

    return NextResponse.json({
      success: true,
      data: {
        requests: requests.map(req => ({
          ...req,
          amount: req.metadata?.price || 0,
          service: {
            name: req.title,
            description: req.description
          }
        })),
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
    }) as unknown as ServiceRequest;

    // Transform the response to match the expected format
    const transformedRequest = {
      ...updatedRequest,
      amount: updatedRequest.metadata?.price || 0,
      service: {
        name: updatedRequest.title,
        description: updatedRequest.description
      }
    };

    // Here you would typically send an email notification to the client
    // about their payment request status update

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