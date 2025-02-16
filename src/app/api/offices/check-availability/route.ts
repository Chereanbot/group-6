import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const officeId = searchParams.get('officeId');

    if (!officeId) {
      return NextResponse.json(
        { error: 'Office ID is required' },
        { status: 400 }
      );
    }

    // Check if office exists and count active coordinators
    const office = await prisma.office.findUnique({
      where: { id: officeId },
      include: {
        _count: {
          select: {
            coordinators: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    // You can set your own threshold for maximum coordinators per office
    const MAX_COORDINATORS = 5;
    const isAvailable = office._count.coordinators < MAX_COORDINATORS;

    return NextResponse.json({
      available: isAvailable,
      currentCount: office._count.coordinators,
      maxAllowed: MAX_COORDINATORS
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check office availability' },
      { status: 500 }
    );
  }
} 