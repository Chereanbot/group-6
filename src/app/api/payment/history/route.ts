import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch payment history from the database
    const payments = await prisma.payment.findMany({
      where: {
        serviceRequest: {
          clientId: user.id
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