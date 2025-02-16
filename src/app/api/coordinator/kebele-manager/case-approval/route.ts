import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { 
      caseId, 
      kebeleId, 
      managerId, 
      approved, 
      notes 
    } = await request.json();

    // Verify the manager belongs to the kebele
    const manager = await prisma.kebeleManager.findFirst({
      where: {
        id: managerId,
        kebeleId
      }
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Unauthorized: Manager not found for this kebele' },
        { status: 403 }
      );
    }

    // Update case with approval status
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        kebeleApproval: {
          create: {
            approved,
            notes,
            approvedBy: managerId,
            approvedAt: new Date()
          }
        }
      },
      include: {
        kebeleApproval: true,
        client: true
      }
    });

    // Create notification for the client
    await prisma.notification.create({
      data: {
        userId: updatedCase.clientId,
        title: `Case Document ${approved ? 'Approved' : 'Rejected'} by Kebele`,
        message: `Your case documents have been ${approved ? 'approved' : 'rejected'} by the kebele office. ${notes ? `Notes: ${notes}` : ''}`,
        type: 'DOCUMENT_UPLOAD',
        priority: 'HIGH',
        caseId: caseId
      }
    });

    return NextResponse.json({
      success: true,
      case: updatedCase
    });
  } catch (error) {
    console.error('Error processing case approval:', error);
    return NextResponse.json(
      { error: 'Failed to process case approval' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kebeleId = searchParams.get('kebeleId');

    if (!kebeleId) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    // Get all cases pending kebele approval for this kebele
    const pendingCases = await prisma.case.findMany({
      where: {
        kebeleId,
        kebeleApproval: null // Only get cases without approval
      },
      include: {
        client: {
          select: {
            fullName: true,
            phone: true,
            email: true
          }
        },
        documents: true
      }
    });

    return NextResponse.json(pendingCases);
  } catch (error) {
    console.error('Error fetching pending cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending cases' },
      { status: 500 }
    );
  }
} 