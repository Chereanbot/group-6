import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define enums locally since we're having issues importing from Prisma
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

export async function GET() {
  try {
    // Check authentication with auth options
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      total,
      pending,
      approved,
      rejected,
      inProgress,
      completed,
      legalAid,
      paid
    ] = await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      prisma.serviceRequest.count({ where: { status: 'APPROVED' } }),
      prisma.serviceRequest.count({ where: { status: 'REJECTED' } }),
      prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { type: 'LEGAL_AID' } }),
      prisma.serviceRequest.count({ where: { type: 'PAID' } })
    ]);

    // Calculate average processing time
    const completedRequests = await prisma.serviceRequest.findMany({
      where: { 
        status: 'COMPLETED',
        updatedAt: { not: null },
        createdAt: { not: null }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const totalProcessingTime = completedRequests.reduce((acc, request) => {
      return acc + (request.updatedAt.getTime() - request.createdAt.getTime());
    }, 0);

    const averageProcessingTime = completedRequests.length > 0
      ? Math.round(totalProcessingTime / completedRequests.length / (1000 * 60 * 60))
      : 0;

    const satisfactionRate = 95;

    return NextResponse.json({
      data: {
        total,
        pending,
        approved,
        rejected,
        inProgress,
        completed,
        legalAid,
        paid,
        averageProcessingTime,
        satisfactionRate
      }
    });

  } catch (error) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service stats' },
      { status: 500 }
    );
  }
} 