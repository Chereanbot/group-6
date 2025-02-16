import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { caseId, lawyerId, isReassignment } = await request.json();

    if (!caseId || !lawyerId) {
      return NextResponse.json(
        { error: 'Case ID and Lawyer ID are required' },
        { status: 400 }
      );
    }

    // Check if the case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if case is already assigned and it's not a reassignment
    if (existingCase.lawyerId && !isReassignment) {
      return NextResponse.json(
        { error: 'Case is already assigned' },
        { status: 400 }
      );
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        lawyerId,
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    // Create a case assignment record
    await prisma.caseAssignment.create({
      data: {
        caseId,
        assignedToId: lawyerId,
        assignedById: existingCase.clientId,
        status: 'ACCEPTED',
        notes: isReassignment 
          ? `Case reassigned to lawyer on ${new Date().toLocaleDateString()}`
          : `Case assigned to lawyer on ${new Date().toLocaleDateString()}`
      }
    });

    // Create an activity record
    await prisma.caseActivity.create({
      data: {
        caseId,
        userId: lawyerId,
        title: isReassignment ? 'Case Reassigned' : 'Case Assigned',
        description: isReassignment 
          ? 'Case was reassigned to a new lawyer'
          : 'Case was assigned to lawyer',
        type: 'ASSIGNMENT'
      }
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Error assigning case:', error);
    return NextResponse.json(
      { error: 'Failed to assign case' },
      { status: 500 }
    );
  }
} 