import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch payment history from the database
    const payments = await prisma.payment.findMany({
      where: {
        serviceRequest: {
          clientId: session.user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        serviceRequest: {
          select: {
            package: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Format the payments data
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      date: payment.createdAt,
      amount: payment.amount,
      status: payment.status.toLowerCase(),
      plan: payment.serviceRequest?.package?.name || 'Unknown Plan'
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments
    });

  } catch (error) {
    console.error('Failed to fetch payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
} 