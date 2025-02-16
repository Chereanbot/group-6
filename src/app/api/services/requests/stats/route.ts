import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      total,
      pending,
      approved,
      rejected,
      inProgress,
      completed,
      legalAid,
      paid,
    ] = await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      prisma.serviceRequest.count({ where: { status: 'APPROVED' } }),
      prisma.serviceRequest.count({ where: { status: 'REJECTED' } }),
      prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { serviceType: 'LEGAL_AID' } }),
      prisma.serviceRequest.count({ where: { serviceType: 'PAID' } }),
    ]);

    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      inProgress,
      completed,
      legalAid,
      paid,
      averageProcessingTime: 0, // Calculate this based on your needs
      satisfactionRate: 95 // Mock value
    });
  } catch (error) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service stats' },
      { status: 500 }
    );
  }
} 