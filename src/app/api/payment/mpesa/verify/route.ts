import { NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import axios from 'axios';

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '98BGVGMQOgzmMLFM4QTLPxbFIKsx2FtLeGa77aTGQVrOGNRT1zQuJL2EqDO42wPD';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'eHEmLxxGEctqEIfBlEx0kD10Yc4iodWmNJSeHyh1qlodI544';
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

const MPESA_AUTH_URL = MPESA_ENV === 'sandbox' 
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const MPESA_QUERY_URL = MPESA_ENV === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
  : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { CheckoutRequestID, tx_ref } = body;

    if (!CheckoutRequestID || !tx_ref) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get M-Pesa access token
    const authResponse = await axios.get(MPESA_AUTH_URL, {
      auth: {
        username: MPESA_CONSUMER_KEY,
        password: MPESA_CONSUMER_SECRET
      }
    });

    const accessToken = authResponse.data.access_token;

    // Query M-Pesa STK Push status
    const queryResponse = await axios.post(
      MPESA_QUERY_URL,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: process.env.MPESA_PASSKEY,
        Timestamp: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3),
        CheckoutRequestID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        metadata: {
          equals: JSON.stringify({ tx_ref })
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status based on M-Pesa response
    const resultCode = queryResponse.data.ResultCode;
    const isSuccess = resultCode === 0;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        metadata: {
          tx_ref,
          mpesaQueryResponse: queryResponse.data,
          verifiedAt: new Date().toISOString()
        },
        paidAt: isSuccess ? new Date() : null
      }
    });

    // If payment is successful, update service request status
    if (isSuccess) {
      await prisma.serviceRequest.update({
        where: { id: payment.serviceRequestId },
        data: {
          status: 'APPROVED',
          paymentStatus: 'PAID',
          currentStage: 'Payment Completed',
          nextAction: 'Awaiting Assignment'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: isSuccess ? 'success' : 'failed',
        message: isSuccess ? 'Payment completed successfully' : 'Payment failed',
        details: queryResponse.data
      }
    });
  } catch (error: any) {
    console.error('M-Pesa payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify M-Pesa payment' },
      { status: 500 }
    );
  }
} 