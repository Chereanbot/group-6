import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import prisma from '@/lib/prisma';
import { PaymentMethod, PaymentStatus, ServiceType } from '@prisma/client';
import crypto from 'crypto';

// Chapa API Keys
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-cIE6IPsupgrF0aQnIU4cmK0PkeJBOfwX';
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';
const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';

// Generate a unique transaction reference
const generateTxRef = () => {
  return `TX-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
};

// Validate email format
const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Validate phone format
const isValidPhone = (phone: string) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export async function POST(request: Request) {
  let payment;
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token found'
      }, { status: 401 });
    }

    // Verify authentication
    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
    }

    const body = await request.json();
    const { amount, email, first_name, last_name, phone, metadata } = body;

    // Validate required fields
    if (!amount || !email || !first_name || !last_name || !phone) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: amount, email, first_name, last_name, phone'
      }, { status: 400 });
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid amount'
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number format'
      }, { status: 400 });
    }

    // Generate a unique transaction reference
    const tx_ref = generateTxRef();

    // Update user's full name
    await prisma.user.update({
      where: { id: payload.id },
      data: { fullName: `${first_name} ${last_name}` }
    });

    // Update or create client profile
    await prisma.clientProfile.upsert({
      where: {
        userId: payload.id
      },
      create: {
        userId: payload.id,
        age: 0,
        sex: 'OTHER',
        phone,
        numberOfFamily: 0,
        healthStatus: 'HEALTHY',
        region: '',
        zone: '',
        wereda: '',
        kebele: '',
        caseType: 'CIVIL',
        caseCategory: 'OTHER',
        officeId: metadata?.officeId || '',
        guidelines: []
      },
      update: {
        phone,
        guidelines: {
          set: []
        }
      }
    });

    // First, get or create the service package
    let servicePackage = await prisma.servicePackage.findFirst({
      where: {
        name: metadata?.planId || 'BASIC',
        active: true
      }
    });

    if (!servicePackage) {
      // Create a default package if none exists
      servicePackage = await prisma.servicePackage.create({
        data: {
          name: metadata?.planId || 'BASIC',
          description: 'Basic Legal Service Package',
          serviceType: ServiceType.BASIC,
          category: 'OTHER',
          price: parseFloat(amount),
          features: ['Basic legal consultation', 'Document review'],
          eligibilityCriteria: ['Valid identification', 'Proof of residence'],
          estimatedDuration: '30 days',
          active: true,
          authorId: payload.id,
          createdById: payload.id
        }
      });
    }

    // Create a payment record in the database
    payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: 'ETB',
        status: PaymentStatus.PENDING,
        transactionId: tx_ref,
        method: PaymentMethod.CREDIT_CARD,
        serviceRequest: {
          create: {
            clientId: payload.id,
            title: `${servicePackage.name} Plan Initial Payment`,
            status: 'PENDING',
            packageId: servicePackage.id,
            description: `Initial payment for ${servicePackage.name} plan - ${metadata?.billingPeriod || 'Monthly'} billing`,
            priority: 'HIGH',
            requirements: [
              'Valid ID',
              'Proof of Address',
              'Case Documentation'
            ]
          }
        }
      }
    });

    // Prepare the request payload for Chapa
    const chapaPayload = {
      amount: amount.toString(),
      currency: 'ETB',
      email,
      first_name,
      last_name,
      tx_ref,
      callback_url: `${request.headers.get('origin')}/api/payment/verify`,
      return_url: `${request.headers.get('origin')}/client/registration/personal-info`,
      customization: {
        title: 'Legal Payment',
        description: 'Initial payment for legal services'
      }
    };

    // Initialize payment with Chapa
    const response = await fetch(CHAPA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'X-CHAPA-PUBLIC-KEY': CHAPA_PUBLIC_KEY
      },
      body: JSON.stringify(chapaPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Update payment status to FAILED if Chapa initialization fails
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });

      return NextResponse.json({
        success: false,
        message: responseData.message || 'Failed to initialize payment',
        details: responseData
      }, { status: response.status });
    }

    if (!responseData.data?.checkout_url) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });

      return NextResponse.json({
        success: false,
        message: 'Failed to get checkout URL',
        details: responseData
      }, { status: 500 });
    }

    // Update payment record with checkout URL and metadata
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          checkoutUrl: responseData.data.checkout_url,
          clientProfile: metadata?.clientProfile,
          planDetails: {
            planId: servicePackage.id,
            planName: servicePackage.name,
            billingPeriod: metadata?.billingPeriod || 'Monthly',
            isInitialPayment: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: responseData.data.checkout_url,
        tx_ref,
        payment_id: payment.id
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    
    // If a payment was created, update it to failed status
    if (payment?.id) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED }
      });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process payment',
      details: error instanceof Error ? error.toString() : 'Unknown error'
    }, { status: 500 });
  }
} 