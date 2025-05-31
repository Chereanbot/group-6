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
    price?: number;
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
    const { ids, status, notes } = data;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Limit the number of requests that can be updated at once
    if (ids.length > 50) {
      return NextResponse.json(
        { success: false, message: "Cannot update more than 50 requests at once" },
        { status: 400 }
      );
    }

    // Update all selected requests in a transaction
    const updatedRequests = await prisma.$transaction(
      ids.map(id =>
        prisma.serviceRequest.update({
          where: { id },
          data: {
            status: status as RequestStatus,
            ...(notes && {
              notes: {
                create: {
                  content: notes.content,
                  type: 'STATUS_UPDATE',
                  userId: adminCheck.authResult.user.id,
                  isPrivate: false
                }
              }
            })
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
          }
        })
      )
    );

    // Transform the response
    const transformedRequests = updatedRequests.map(request => ({
      ...request,
      amount: (request.metadata as any)?.price || 0,
      service: {
        name: request.title,
        description: request.description
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedRequests
    });

  } catch (error) {
    console.error('Error updating payment requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update payment requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 