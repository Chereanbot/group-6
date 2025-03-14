import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CHAPA_SECRET_KEY = 'CHASECK_TEST-cIE6IPsupgrF0aQnIU4cmK0PkeJBOfwX';
const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify/';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tx_ref } = body;

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

    // If payment is verified, update your database
    if (verificationData.status === 'success') {
      // Update payment status in your database
      await prisma.payment.create({
        data: {
          amount: verificationData.amount,
          currency: verificationData.currency,
          status: 'COMPLETED',
          transactionId: tx_ref,
          paymentMethod: 'CHAPA',
          metadata: verificationData
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully'
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
        // Redirect to success page
        return NextResponse.redirect('/client/registration/personal-info');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect('/client/registration/payment?error=1');
} 