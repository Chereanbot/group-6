import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PaymentStatus, Prisma } from '@prisma/client';

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-cIE6IPsupgrF0aQnIU4cmK0PkeJBOfwX';
const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify/';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tx_ref } = body;

    if (!tx_ref) {
      return NextResponse.json({
        success: false,
        message: 'Transaction reference is required'
      }, { status: 400 });
    }

    // Find existing payment
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: tx_ref },
      include: {
        serviceRequest: true
      }
    });

    if (!existingPayment) {
      return NextResponse.json({
        success: false,
        message: 'Payment record not found'
      }, { status: 404 });
    }

    // Verify the transaction with Chapa
    const response = await fetch(`${CHAPA_VERIFY_URL}${tx_ref}`, {
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const verificationData = await response.json();

    if (!response.ok) {
      throw new Error(verificationData.message || 'Payment verification failed');
    }

    // If payment is verified, update the database
    if (verificationData.status === 'success') {
      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          metadata: verificationData as Prisma.JsonObject
        },
        include: {
          serviceRequest: true
        }
      });

      // Update service request status if it exists
      if (updatedPayment.serviceRequest) {
        await prisma.serviceRequest.update({
          where: { id: updatedPayment.serviceRequest.id },
          data: {
            status: 'IN_PROGRESS',
            updatedAt: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: updatedPayment.id,
          amount: updatedPayment.amount,
          status: updatedPayment.status,
          serviceRequestId: updatedPayment.serviceRequest?.id
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Payment verification failed'
    }, { status: 400 });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed'
    }, { status: 500 });
  }
}

// Handle GET request for return URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tx_ref = searchParams.get('tx_ref');
  const status = searchParams.get('status');

  if (status === 'success' && tx_ref) {
    // Verify the transaction
    try {
      const response = await fetch(`${CHAPA_VERIFY_URL}${tx_ref}`, {
        headers: {
          'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const verificationData = await response.json();

      if (response.ok && verificationData.status === 'success') {
        // Find and update the payment
        const payment = await prisma.payment.findFirst({
          where: { transactionId: tx_ref },
          include: { serviceRequest: true }
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              metadata: verificationData as Prisma.JsonObject
            }
          });

          if (payment.serviceRequest) {
            await prisma.serviceRequest.update({
              where: { id: payment.serviceRequest.id },
              data: {
                status: 'IN_PROGRESS',
                updatedAt: new Date()
              }
            });
          }
        }

        // Redirect to success page
        return NextResponse.redirect('/client/registration/personal-info?payment=success');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect('/client/registration/payment?error=payment-failed');
} 