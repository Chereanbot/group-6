import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: null,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching unassigned cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unassigned cases' },
      { status: 500 }
    );
  }
} 