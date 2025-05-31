import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

// Define enums locally
enum ServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum ServiceType {
  LEGAL_AID = 'LEGAL_AID',
  PAID = 'PAID',
  CONSULTATION = 'CONSULTATION'
}

// Helper function to verify admin authorization
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

export async function GET(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm');

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (searchTerm) {
      where.OR = [
        { client: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
        { client: { email: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        assignedLawyer: {
          select: {
            fullName: true,
            email: true,
          },
        },
        package: {
          select: {
            name: true,
            price: true,
          },
        },
        payments: {
          select: {
            status: true,
            amount: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ 
      success: true,
      data: requests 
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch service requests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const data = await request.json();

    const serviceRequest = await prisma.serviceRequest.create({
      data,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        serviceDocuments: {
          include: {
            document: true,
          },
        },
        IncomeProof: {
          include: {
            documents: {
              include: {
                document: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create service request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 