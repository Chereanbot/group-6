import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const specializations = await prisma.legalSpecialization.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ data: specializations });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specializations' },
      { status: 500 }
    );
  }
} 