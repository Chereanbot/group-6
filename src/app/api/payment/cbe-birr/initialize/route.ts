import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import prisma from '@/lib/prisma';
import { PaymentMethod, PaymentStatus, ServiceType } from '@prisma/client';
import crypto from 'crypto';

// Generate a unique transaction reference
const generateTxRef = () => {
  return `CBE-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
};

// CBE Birr test account number (replace with actual account in production)
const CBE_BIRR_ACCOUNT = process.env.CBE_BIRR_ACCOUNT || '1000123456789';

export async function POST(request: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify authentication
    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, email, fullName, phone, metadata } = body;

    // Validate required fields
    if (!amount || !email || !fullName || !phone) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: amount, email, fullName, phone'
      }, { status: 400 });
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid amount'
      }, { status: 400 });
    }

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

    // Generate a unique transaction reference
    const tx_ref = generateTxRef();

    // Create a payment record in the database
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: 'ETB',
        status: PaymentStatus.PENDING,
        transactionId: tx_ref,
        method: PaymentMethod.BANK_TRANSFER,
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
        },
        metadata: {
          clientProfile: metadata?.clientProfile,
          planDetails: {
            planId: servicePackage.id,
            planName: servicePackage.name,
            billingPeriod: metadata?.billingPeriod || 'Monthly',
            isInitialPayment: true
          },
          cbeDetails: {
            accountNumber: CBE_BIRR_ACCOUNT,
            accountName: 'Legal Services',
            bankName: 'Commercial Bank of Ethiopia'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        tx_ref,
        payment_id: payment.id,
        accountNumber: CBE_BIRR_ACCOUNT,
        accountName: 'Legal Services',
        bankName: 'Commercial Bank of Ethiopia',
        amount: amount,
        currency: 'ETB'
      }
    });

  } catch (error) {
    console.error('CBE Birr payment initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 