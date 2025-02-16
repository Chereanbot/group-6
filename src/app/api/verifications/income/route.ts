import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { requestId, verified, notes } = await request.json();

    const updatedIncomeProof = await prisma.incomeProof.update({
      where: {
        serviceRequestId: requestId
      },
      data: {
        verified,
        verifiedAt: new Date(),
        verificationNotes: notes
      }
    });

    // If verified and meets criteria, automatically approve the request
    if (verified) {
      const request = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: { incomeProof: true }
      });

      if (request?.incomeProof?.annualIncome <= process.env.LEGAL_AID_INCOME_THRESHOLD) {
        await prisma.serviceRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' }
        });
      }
    }

    return NextResponse.json(updatedIncomeProof);
  } catch (error) {
    console.error('Error verifying income:', error);
    return NextResponse.json(
      { error: 'Failed to verify income' },
      { status: 500 }
    );
  }
} 