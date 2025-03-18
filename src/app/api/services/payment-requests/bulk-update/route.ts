import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, PaymentStatus } from '@prisma/client';

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
    const { ids, status, notes } = data;

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update all selected requests
    const updatedRequests = await prisma.$transaction(
      ids.map(id =>
        prisma.serviceRequest.update({
          where: { id },
          data: {
            status: status as PaymentStatus,
            ...(notes && {
              notes: {
                create: {
                  content: notes.content,
                  type: 'STATUS_UPDATE',
                  user: {
                    connect: {
                      id: notes.userId
                    }
                  }
                }
              }
            }),
            processedAt: status === PaymentStatus.COMPLETED ? new Date() : undefined
          },
          include: {
            client: {
              select: {
                email: true,
                fullName: true
              }
            }
          }
        })
      )
    );

    // Transform the response
    const transformedRequests = updatedRequests.map(request => ({
      ...request,
      amount: request.metadata?.price || 0,
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