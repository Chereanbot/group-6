import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all payments for the user
    const payments = await prisma.payment.findMany({
      where: {
        serviceRequest: {
          clientId: user.id
        }
      },
      include: {
        serviceRequest: {
          select: {
            title: true,
            package: {
              select: {
                name: true,
                serviceType: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create CSV content
    const headers = [
      'Transaction ID',
      'Date',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Service Package',
      'Service Type',
      'Description'
    ].join(',');

    const rows = payments.map(payment => [
      payment.transactionId || '',
      format(new Date(payment.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      payment.amount,
      payment.currency,
      payment.status,
      payment.method,
      payment.serviceRequest.package.name,
      payment.serviceRequest.package.serviceType,
      payment.description || ''
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers, ...rows].join('\n');

    // Create response with CSV file
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="payment-history-${format(new Date(), 'yyyy-MM-dd')}.csv"`);

    return response;

  } catch (error) {
    console.error('Failed to export payment history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export payment history' },
      { status: 500 }
    );
  }
} 