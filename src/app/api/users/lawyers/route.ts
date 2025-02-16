import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available') === 'true';
    const specialization = searchParams.get('specialization');
    const officeId = searchParams.get('officeId');

    const where = {
      role: 'LAWYER',
      status: 'ACTIVE',
      lawyerProfile: {
        ...(available && { availability: true }),
        ...(specialization && { specializations: { has: specialization } }),
        ...(officeId && { officeId })
      }
    };

    const lawyers = await prisma.user.findMany({
      where,
      include: {
        lawyerProfile: {
          select: {
            specializations: true,
            experience: true,
            rating: true,
            caseLoad: true,
            availability: true
          }
        }
      }
    });

    return NextResponse.json(lawyers);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
} 