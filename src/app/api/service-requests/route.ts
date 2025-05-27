import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRoleEnum, RequestStatus, ServiceType, Priority, ServiceCategory } from '@prisma/client';
import prisma from '@/lib/prisma';

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
    const { packageId, title, description, requirements, serviceType } = body;

    // Validate required fields
    if (!packageId || !title || !serviceType) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, create a service package if it doesn't exist
    const servicePackage = await prisma.servicePackage.create({
      data: {
        name: title.split(' ')[0],
        description: description || '',
        serviceType: serviceType,
        category: ServiceCategory.OTHER,
        price: 0,
        features: requirements || [],
        eligibilityCriteria: [],
        estimatedDuration: '1 month',
        active: true,
        authorId: user.id,
        createdById: user.id
      }
    });

    // Create service request with package relation
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        client: {
          connect: {
            id: user.id
          }
        },
        package: {
          connect: {
            id: servicePackage.id
          }
        },
        title,
        description: description || '',
        requirements: requirements || [],
        status: RequestStatus.PENDING,
        priority: Priority.MEDIUM,
        progress: 0,
        currentStage: 'Payment Pending',
        nextAction: 'Complete Payment',
        paymentStatus: 'PENDING',
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          packageId: packageId,
          packageName: title.split(' ')[0],
          serviceType: serviceType
        },
        tags: [],
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(serviceRequest);
  } catch (error: any) {
    console.error('Service request creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: any = {};
    if (user.userRole === UserRoleEnum.CLIENT) {
      where.clientId = user.id;
    } else if (user.userRole === UserRoleEnum.LAWYER) {
      where.assignedLawyerId = user.id;
    }

    if (status) {
      where.status = status;
    }

    // Get service requests
    const [serviceRequests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          package: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return NextResponse.json({
      serviceRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Service request fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
} 