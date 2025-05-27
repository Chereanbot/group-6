import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { UserRoleEnum, PaymentStatus } from '@prisma/client';

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-UELfvjNgEw0q6XGT7BZiEopA1kz6qDpI';
const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/verify';

export async function POST(request: Request) {
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

    // Get transaction reference from request body
    const { tx_ref } = await request.json();
    if (!tx_ref) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Chapa
    const response = await axios.get(`${CHAPA_API_URL}/${tx_ref}`, {
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const paymentData = response.data;

    // Check payment status
    if (paymentData.status === 'success') {
      // Update payment record in database
      const payment = await prisma.payment.findFirst({
        where: {
          transactionId: tx_ref
        }
      });

      if (payment) {
        const updatedMetadata = {
          ...(payment.metadata as Record<string, any>),
          verifiedAt: new Date().toISOString(),
          chapaResponse: paymentData
        };

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            metadata: updatedMetadata
          }
        });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Payment verified successfully',
        transactionId: tx_ref,
        amount: paymentData.amount,
        date: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        status: 'failed',
        message: 'Payment verification failed',
        error: paymentData.message || 'Unknown error'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      status: 'failed',
      message: error.message || 'Failed to verify payment',
      error: error.response?.data?.message || 'Unknown error'
    }, { status: 500 });
  }
} 