import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        cases: {
          include: {
            client: true,
            documents: true
          }
        },
        specializations: true,
        performance: true
      }
    });

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lawyer);
  } catch (error) {
    console.error('Error fetching lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const lawyer = await prisma.lawyer.update({
      where: { id: params.id },
      data: {
        user: {
          update: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone
          }
        },
        specialization: data.specialization,
        academicRank: data.title,
        maxCaseload: data.maxCaseload,
        availabilityHours: data.availabilityHours
      }
    });

    return NextResponse.json(lawyer);
  } catch (error) {
    console.error('Error updating lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to update lawyer' },
      { status: 500 }
    );
  }
} 