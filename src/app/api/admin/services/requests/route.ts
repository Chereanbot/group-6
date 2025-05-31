import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, RequestStatus, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

export async function GET(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as RequestStatus | null;
    const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null;

    const where = {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    };

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          paymentStatus: true,
          quotedPrice: true,
          finalPrice: true,
          submittedAt: true,
          updatedAt: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              serviceType: true,
              description: true,
              price: true
            }
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          payments: true,
          serviceDocuments: {
            include: {
              document: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 