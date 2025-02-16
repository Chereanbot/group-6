import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
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

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { error: 'Failed to update service request' },
      { status: 500 }
    );
  }
} 