import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const updatedAppeal = await prisma.appeal.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'DECIDED' && !data.decidedAt && { decidedAt: new Date() })
      },
      include: {
        case: {
          select: {
            title: true,
            status: true,
            priority: true
          }
        },
        documents: true
      }
    });

    return NextResponse.json(updatedAppeal);
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json(
      { error: 'Failed to update appeal' },
      { status: 500 }
    );
  }
} 