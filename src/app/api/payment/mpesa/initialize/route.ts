import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRoleEnum, PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import axios from 'axios';

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '98BGVGMQOgzmMLFM4QTLPxbFIKsx2FtLeGa77aTGQVrOGNRT1zQuJL2EqDO42wPD';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'eHEmLxxGEctqEIfBlEx0kD10Yc4iodWmNJSeHyh1qlodI544';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

// M-Pesa API endpoints
const MPESA_AUTH_URL = MPESA_ENV === 'sandbox' 
  ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const MPESA_STK_PUSH_URL = MPESA_ENV === 'sandbox'
  ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { amount, phoneNumber, serviceRequestId } = body;

    if (!amount || !phoneNumber || !serviceRequestId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const tx_ref = `MPESA-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: 'KES',
        status: PaymentStatus.PENDING,
        method: PaymentMethod.BANK_TRANSFER,
        serviceRequest: {
          connect: {
            id: serviceRequestId
          }
        },
        metadata: {
          tx_ref,
          phoneNumber,
          paymentProvider: 'MPESA'
        },
      },
    });

    // Get M-Pesa access token
    const authResponse = await axios.get(MPESA_AUTH_URL, {
      auth: {
        username: MPESA_CONSUMER_KEY,
        password: MPESA_CONSUMER_SECRET
      }
    });

    const accessToken = authResponse.data.access_token;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Initialize M-Pesa STK Push
    const stkPushResponse = await axios.post(
      MPESA_STK_PUSH_URL,
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/mpesa/verify`,
        AccountReference: tx_ref,
        TransactionDesc: 'Legal Service Payment'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update payment record with M-Pesa response
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          tx_ref,
          phoneNumber,
          paymentProvider: 'MPESA',
          mpesaResponse: stkPushResponse.data,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        CheckoutRequestID: stkPushResponse.data.CheckoutRequestID,
        tx_ref,
        message: 'Please check your phone to complete the payment'
      }
    });
  } catch (error: any) {
    console.error('M-Pesa payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize M-Pesa payment' },
      { status: 500 }
    );
  }
} 