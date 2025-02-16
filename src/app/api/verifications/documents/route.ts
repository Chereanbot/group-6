import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { documentIds, requestId } = await request.json();

    if (!documentIds?.length) {
      return NextResponse.json(
        { error: 'No documents provided for verification' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // First verify all documents
      const verifiedDocs = await Promise.all(
        documentIds.map((id: string) =>
          tx.serviceDocument.update({
            where: { id },
            data: {
              verified: true,
              verifiedAt: new Date()
            }
          })
        )
      );

      // Get the service request with all related data
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id: requestId },
        include: {
          documents: true,
          payment: true,
          incomeProof: true,
          client: true // Include client for notification
        }
      });

      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      // Create verification records
      await Promise.all(
        documentIds.map((documentId: string) =>
          tx.verificationRecord.create({
            data: {
              serviceRequestId: requestId,
              documentId,
              type: 'DOCUMENT',
              status: 'VERIFIED',
              verifiedAt: new Date()
            }
          })
        )
      );

      // Check if all required verifications are complete
      const allDocsVerified = serviceRequest.documents.every(doc => doc.verified);
      const paymentVerified = !serviceRequest.payment || serviceRequest.payment.verified;
      const incomeVerified = !serviceRequest.incomeProof || serviceRequest.incomeProof.verified;

      if (allDocsVerified && paymentVerified && incomeVerified) {
        // Update service request to COMPLETED status
        await tx.serviceRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED'
          }
        });

        // Create completion activity
        await tx.serviceActivity.create({
          data: {
            requestId,
            type: 'STATUS_UPDATE',
            description: 'All verifications completed. Request marked as completed.',
            userId: serviceRequest.assignedLawyerId || serviceRequest.clientId // Use assigned lawyer or client ID
          }
        });

        // Create notification for client
        await tx.notification.create({
          data: {
            userId: serviceRequest.clientId,
            title: 'Service Request Completed',
            content: 'All verifications have been completed for your service request.',
            type: 'SERVICE_UPDATE',
            read: false
          }
        });
      }

      return {
        documents: verifiedDocs,
        request: serviceRequest
      };
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error verifying documents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 