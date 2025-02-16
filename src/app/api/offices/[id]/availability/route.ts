import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const officeId = params.id;

    // Get office details with active coordinators count
    const office = await prisma.office.findUnique({
      where: { 
        id: officeId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        coordinators: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found or inactive' },
        { status: 404 }
      );
    }

    // Check if office has reached its capacity
    const maxAllowed = office.capacity || 10; // Default to 10 if not set
    const currentCount = office.coordinators.length;
    const available = currentCount < maxAllowed;
    const remaining = maxAllowed - currentCount;

    return NextResponse.json({
      available,
      maxAllowed,
      currentCount,
      remaining,
      officeName: office.name
    });

  } catch (error) {
    console.error('Error checking office availability:', error);
    return NextResponse.json(
      { error: 'Failed to check office availability' },
      { status: 500 }
    );
  }
} 