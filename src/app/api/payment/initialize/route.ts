import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import prisma from '@/lib/prisma';
import { PaymentMethod, PaymentStatus, ServiceType, ServiceCategory } from '@prisma/client';
import crypto from 'crypto';

// Chapa API Keys
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-cIE6IPsupgrF0aQnIU4cmK0PkeJBOfwX';
const CHAPA_PUBLIC_KEY = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-40nSrRkEurW5fh4da1PD4YbDEnAEDgxg';
const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';

// Default service packages
const DEFAULT_SERVICE_PACKAGES = [
  {
    name: 'basic',
    description: 'Basic legal consultation and document review services',
    serviceType: 'CONSULTATION' as ServiceType,
    category: ServiceCategory.FAMILY_LAW,
    price: 1000,
    features: [
      'Standard case handling',
      'Email support',
      'Basic document review',
      'Single lawyer consultation',
      'Basic case tracking',
      'Standard response time',
      'Online document access',
      'Monthly case review',
      'Initial consultation included'
    ],
    eligibilityCriteria: ['Valid ID', 'Proof of Address'],
    estimatedDuration: '1-2 weeks'
  },
  {
    name: 'standard',
    description: 'Comprehensive document preparation and legal assistance',
    serviceType: 'DOCUMENT_PREPARATION' as ServiceType,
    category: ServiceCategory.CORPORATE_LAW,
    price: 2500,
    features: [
      'Priority case handling',
      'Phone & email support',
      'Comprehensive document review',
      'Multiple lawyer consultations',
      'Case strategy planning',
      'Priority response time',
      'Advanced case tracking',
      'Bi-weekly case review',
      'Document templates',
      'Legal research assistance',
      'Premium initial consultation'
    ],
    eligibilityCriteria: ['Valid ID', 'Proof of Address', 'Case Documentation'],
    estimatedDuration: '2-4 weeks'
  },
  {
    name: 'premium',
    description: 'Full legal representation and court appearance services',
    serviceType: 'COURT_APPEARANCE' as ServiceType,
    category: ServiceCategory.CRIMINAL_LAW,
    price: 5000,
    features: [
      'VIP case handling',
      '24/7 support access',
      'Full document management',
      'Senior lawyer assignment',
      'Strategy & planning sessions',
      'Court representation priority',
      'Instant response time',
      'Real-time case updates',
      'Weekly strategy meetings',
      'Dedicated case manager',
      'Premium document templates',
      'Legal research team',
      'Executive consultation package'
    ],
    eligibilityCriteria: ['Valid ID', 'Proof of Address', 'Case Documentation', 'Court Records'],
    estimatedDuration: '4-8 weeks'
  }
];

// Add this before the ensureServicePackages function
const isValidServiceType = (type: any): type is ServiceType => {
  return Object.values(ServiceType).includes(type);
};

// Function to ensure service packages exist
async function ensureServicePackages() {
  try {
    for (const pkg of DEFAULT_SERVICE_PACKAGES) {
      try {
        // Validate service type before proceeding
        if (!isValidServiceType(pkg.serviceType)) {
          console.error(`Invalid service type ${pkg.serviceType} for package ${pkg.name}`);
          continue;
        }

        // First check if package exists
        const existingPackage = await prisma.servicePackage.findFirst({
          where: {
            name: pkg.name.toLowerCase(),
            active: true
          }
        });

        if (!existingPackage) {
          // Create a default admin user if not exists
          const adminUser = await prisma.user.findFirst({
            where: { isAdmin: true }
          });

          if (!adminUser) {
            console.error('No admin user found to create service packages');
            continue;
          }

          // Create the package with validated enum values
          await prisma.servicePackage.create({
            data: {
              name: pkg.name.toLowerCase(),
              description: pkg.description,
              serviceType: pkg.serviceType,
              category: pkg.category,
              price: pkg.price,
              features: pkg.features,
              eligibilityCriteria: pkg.eligibilityCriteria,
              estimatedDuration: pkg.estimatedDuration,
              authorId: adminUser.id,
              createdById: adminUser.id,
              active: true
            }
          });
          console.log(`Created service package: ${pkg.name}`);
        } else {
          // Update existing package if needed
          await prisma.servicePackage.update({
            where: { id: existingPackage.id },
            data: {
              description: pkg.description,
              serviceType: pkg.serviceType,
              category: pkg.category,
              price: pkg.price,
              features: pkg.features,
              eligibilityCriteria: pkg.eligibilityCriteria,
              estimatedDuration: pkg.estimatedDuration,
              active: true
            }
          });
          console.log(`Updated service package: ${pkg.name}`);
        }
      } catch (packageError) {
        console.error(`Error processing package ${pkg.name}:`, packageError);
        // Continue with next package even if one fails
        continue;
      }
    }
  } catch (error) {
    console.error('Error ensuring service packages:', error);
    throw error; // Re-throw to handle in the POST handler
  }
}

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
        message: 'Missing required fields',
        details: {
          required: ['amount', 'email', 'first_name', 'last_name', 'phone'],
          received: { amount, email, first_name, last_name, phone }
        }
      }, { status: 400 });
    }

    // Validate service type
    if (!metadata?.serviceType || !Object.values(ServiceType).includes(metadata.serviceType)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid service type',
        details: {
          received: metadata?.serviceType,
          allowed: Object.values(ServiceType)
        }
      }, { status: 400 });
    }

    try {
      // Ensure service packages exist
      await ensureServicePackages();
    } catch (error) {
      console.error('Failed to ensure service packages:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to initialize payment - service package error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Get the service package
    const servicePackage = await prisma.servicePackage.findFirst({
      where: {
        name: metadata?.planId?.toLowerCase(),
        serviceType: metadata.serviceType,
        active: true
      }
    });

    if (!servicePackage) {
      return NextResponse.json({
        success: false,
        message: 'Service package not found',
        details: {
          planId: metadata?.planId,
          serviceType: metadata.serviceType
        }
      }, { status: 404 });
    }

    // Validate amount with detailed error
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.log('Validation failed - invalid amount:', amount);
      return NextResponse.json({
        success: false,
        message: 'Invalid amount',
        error: {
          field: 'amount',
          value: amount,
          details: 'Amount must be a positive number'
        }
      }, { status: 400 });
    }

    // Validate email format with detailed error
    if (!isValidEmail(email)) {
      console.log('Validation failed - invalid email:', email);
      return NextResponse.json({
        success: false,
        message: 'Invalid email format',
        error: {
          field: 'email',
          value: email,
          details: 'Please provide a valid email address'
        }
      }, { status: 400 });
    }

    // Validate phone format with detailed error
    if (!isValidPhone(phone)) {
      console.log('Validation failed - invalid phone:', phone);
      return NextResponse.json({
        success: false,
        message: 'Invalid phone number format',
        error: {
          field: 'phone',
          value: phone,
          details: 'Please provide a valid phone number'
        }
      }, { status: 400 });
    }

    // Validate metadata
    if (!metadata?.planId) {
      console.log('Validation failed - missing planId in metadata');
      return NextResponse.json({
        success: false,
        message: 'Missing plan information',
        error: {
          field: 'metadata.planId',
          details: 'Plan ID is required in metadata'
        }
      }, { status: 400 });
    }

    // Validate service type
    if (servicePackage.serviceType !== metadata.serviceType) {
      console.log('Service type mismatch:', {
        expected: servicePackage.serviceType,
        received: metadata.serviceType,
        packageId: servicePackage.id,
        packageName: servicePackage.name
      });
      return NextResponse.json({
        success: false,
        message: 'Service type mismatch',
        error: {
          field: 'metadata.serviceType',
          details: `Selected plan "${metadata.planId}" requires service type "${servicePackage.serviceType}", but "${metadata.serviceType}" was provided`
        }
      }, { status: 400 });
    }

    console.log('Found service package:', {
      id: servicePackage.id,
      name: servicePackage.name,
      serviceType: servicePackage.serviceType,
      price: servicePackage.price,
      category: servicePackage.category
    });

    // Generate a unique transaction reference
    const tx_ref = generateTxRef();

    // Update user's full name
    await prisma.user.update({
      where: { id: payload.id },
      data: { fullName: `${first_name} ${last_name}` }
    });

    // Update or create client profile
    const clientProfile = await prisma.clientProfile.upsert({
      where: {
        userId: payload.id
      },
      create: {
        userId: payload.id,
        age: metadata?.age || 0,
        sex: metadata?.sex || 'OTHER',
        phone,
        numberOfFamily: metadata?.numberOfFamily || 0,
        healthStatus: metadata?.healthStatus || 'HEALTHY',
        region: metadata?.region || '',
        zone: metadata?.zone || '',
        wereda: metadata?.wereda || '',
        kebele: metadata?.kebele || '',
        caseType: metadata?.caseType || 'CIVIL',
        caseCategory: metadata?.caseCategory || 'OTHER',
        officeId: metadata?.officeId || '',
        guidelines: metadata?.guidelines || []
      },
      update: {
        phone,
        region: metadata?.region || undefined,
        zone: metadata?.zone || undefined,
        wereda: metadata?.wereda || undefined,
        kebele: metadata?.kebele || undefined,
        caseType: metadata?.caseType || undefined,
        caseCategory: metadata?.caseCategory || undefined,
        guidelines: metadata?.guidelines || undefined
      }
    });

    // Create service request and payment
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        clientId: payload.id,
        title: metadata?.title || `${servicePackage.name} Service Request`,
        description: metadata?.description || `Service request for ${servicePackage.name} package`,
        status: 'PENDING',
        packageId: servicePackage.id,
        priority: metadata?.priority || 'MEDIUM',
        requirements: metadata?.requirements || [
          'Valid ID',
          'Proof of Address',
          'Case Documentation'
        ],
        metadata: {
          requestType: servicePackage.serviceType,
          billingPeriod: metadata?.billingPeriod || 'MONTHLY',
          additionalNotes: metadata?.additionalNotes
        }
      }
    });

    // Create payment record
    payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: 'ETB',
        status: PaymentStatus.PENDING,
        transactionId: tx_ref,
        method: PaymentMethod.CREDIT_CARD,
        description: `Payment for ${servicePackage.name} service request`,
        serviceRequestId: serviceRequest.id,
        metadata: {
          planId: servicePackage.name,
          serviceType: servicePackage.serviceType,
          billingPeriod: metadata?.billingPeriod || 'MONTHLY'
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
        title: `${servicePackage.name} Service Payment`,
        description: `Payment for ${servicePackage.name} legal service package`
      }
    };

    // Initialize payment with Chapa
    const response = await fetch(CHAPA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chapaPayload)
    });

    const chapaResponse = await response.json();

    if (!response.ok) {
      // If Chapa initialization fails, update payment status
      const errorMessage = chapaResponse.message || 'Payment initialization failed';
      const errorDetails = chapaResponse.error || chapaResponse.details || {};
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: {
            error: errorMessage,
            details: errorDetails
          }
        }
      });

      return NextResponse.json({
        success: false,
        message: errorMessage,
        error: errorDetails
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        paymentId: payment.id,
        serviceRequestId: serviceRequest.id,
        checkoutUrl: chapaResponse.data.checkout_url
      }
    });

  } catch (error) {
    // If payment was created but initialization failed, update its status
    if (payment) {
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      const errorDetails = error instanceof Error ? { stack: error.stack } : {};
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: {
            error: errorMessage,
            details: errorDetails
          }
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment initialization failed',
      error: error instanceof Error ? { stack: error.stack } : {}
    }, { status: 500 });
  }
} 