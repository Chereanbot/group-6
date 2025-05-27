import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRoleEnum, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { isAuthenticated, user } = await verifyAuth(token);
    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      serviceRequest: {
        clientId: user.id
      }
    };
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Count total
    const total = await prisma.payment.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Fetch payments
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        serviceRequest: {
          select: {
            id: true,
            title: true,
            package: {
              select: {
                name: true,
                serviceType: true
              }
            }
          }
        }
      }
    });

    // Format response
    return NextResponse.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          transactionId: payment.transactionId,
          description: payment.description,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          serviceRequest: payment.serviceRequest ? {
            id: payment.serviceRequest.id,
            title: payment.serviceRequest.title,
            package: payment.serviceRequest.package ? {
              name: payment.serviceRequest.package.name,
              serviceType: payment.serviceRequest.package.serviceType
            } : null
          } : null,
          metadata: payment.metadata || null
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch payment history:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payment history' }, { status: 500 });
  }
} 