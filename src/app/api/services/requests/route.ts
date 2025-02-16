import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function GET(request: Request) {
  try {
    // Check authentication with auth options
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
        lawyer: {
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
        payment: {
          select: {
            status: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: requests });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
        documents: true,
        incomeProof: {
          include: {
            documents: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json(serviceRequest);
  } catch (error) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 }
    );
  }
} 