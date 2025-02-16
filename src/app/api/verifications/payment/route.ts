import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json();

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment verification
      const payment = await tx.servicePayment.update({
        where: {
          requestId: requestId
        },
        data: {
          verified: true,
          verifiedAt: new Date(),
          status: 'PAID'
        }
      });

      // Create verification record
      await tx.verificationRecord.create({
        data: {
          serviceRequestId: requestId,
          type: 'PAYMENT',
          status: 'VERIFIED',
          verifiedAt: new Date()
        }
      });

      // Check if all verifications are complete
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id: requestId },
        include: {
          documents: true,
          payment: true,
          incomeProof: true
        }
      });

      // If everything is verified, update the service request status
      if (serviceRequest &&
          serviceRequest.documents.every(d => d.verified) &&
          serviceRequest.payment?.verified &&
          (!serviceRequest.incomeProof || serviceRequest.incomeProof.verified)
      ) {
        await tx.serviceRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED'
          }
        });
      }

      return payment;
    });

    return NextResponse.json({
      success: true,
      payment: result
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 