import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { id } = params;

    // Get the current case to check for assignment changes
    const currentCase = await prisma.case.findUnique({
      where: { id }
    });

    if (!currentCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        // If lawyer is being assigned, update status to ACTIVE
        ...(data.lawyerId && !currentCase.lawyerId ? { status: 'ACTIVE' } : {})
      }
    });

    // If lawyer assignment has changed, create an assignment record
    if (data.lawyerId && data.lawyerId !== currentCase.lawyerId) {
      await prisma.caseAssignment.create({
        data: {
          caseId: id,
          assignedToId: data.lawyerId,
          assignedById: data.updatedBy || currentCase.clientId, // Use current user's ID when available
          status: 'ACCEPTED',
          notes: `Case assigned to lawyer on ${new Date().toLocaleDateString()}`
        }
      });
    }

    // Create an activity record
    await prisma.caseActivity.create({
      data: {
        caseId: id,
        userId: data.updatedBy || '', // Use current user's ID when available
        title: 'Case Updated',
        description: data.lawyerId !== currentCase.lawyerId 
          ? 'Case was assigned to a new lawyer'
          : 'Case details were updated',
        type: data.lawyerId !== currentCase.lawyerId ? 'ASSIGNMENT' : 'UPDATE'
      }
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
} 