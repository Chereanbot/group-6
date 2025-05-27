import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { PaymentMethod, PaymentStatus, UserRoleEnum } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Chapa API credentials
const CHAPA_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-tCKBbOodkNHJADPLGvt9ppIEPs6B8ATM';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-UELfvjNgEw0q6XGT7BZiEopA1kz6qDpI';
const CHAPA_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.chapa.co/v1' 
  : 'https://api.chapa.co/v1';

export async function POST(req: Request) {
  try {
    // Use client-rule-for-401 for authentication and role check
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

    // Parse request body
    const body = await req.json();
    const { amount, email, firstName, lastName, tx_ref, serviceRequestId, callback_url, return_url } = body;

    // Validate required fields
    if (!amount || !email || !tx_ref || !serviceRequestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        currency: 'ETB',
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
        transactionId: tx_ref,
        serviceRequestId: serviceRequestId,
        metadata: {
          email,
          firstName,
          lastName,
          callback_url,
          return_url,
          paymentProvider: 'CHAPA'
        }
      }
    });

    // Initialize Chapa payment
    const chapaRequest = {
      amount: amount.toString(),
      currency: 'ETB',
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      tx_ref,
      callback_url,
      return_url,
      customization: {
        title: 'Legal Payment',
        description: 'Payment for legal services'
      }
    };

    console.log('Sending request to Chapa:', chapaRequest);

    const response = await axios.post(
      `${CHAPA_API_URL}/transaction/initialize`,
      chapaRequest,
      {
        headers: {
          'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.data || !response.data.data.checkout_url) {
      throw new Error('Invalid response from payment provider');
    }

    // Update payment record with checkout URL
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...(payment.metadata as Record<string, any>),
          checkoutUrl: response.data.data.checkout_url
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: response.data.data.checkout_url
      }
    });

  } catch (error: any) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initialize payment'
      },
      { status: error.response?.status || 500 }
    );
  }
}