import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        serviceRequest: {
          select: {
            clientId: true,
            id: true,
            title: true,
            description: true,
            requirements: true,
            status: true,
            package: {
              select: {
                name: true,
                serviceType: true,
                price: true,
                features: true
              }
            }
          }
        }
      }
    });

    if (!payment || payment.serviceRequest?.clientId !== user.id) {
      return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        transactionId: payment.transactionId,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        refundStatus: payment.refundStatus,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason,
        metadata: payment.metadata || null,
        serviceRequest: payment.serviceRequest ? {
          id: payment.serviceRequest.id,
          title: payment.serviceRequest.title,
          description: payment.serviceRequest.description,
          requirements: payment.serviceRequest.requirements,
          status: payment.serviceRequest.status,
          package: payment.serviceRequest.package ? {
            name: payment.serviceRequest.package.name,
            serviceType: payment.serviceRequest.package.serviceType,
            price: payment.serviceRequest.package.price,
            features: payment.serviceRequest.package.features
          } : null
        } : null
      }
    });
  } catch (error) {
    console.error('Failed to fetch payment detail:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payment detail' }, { status: 500 });
  }
} 