import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const lawyers = await prisma.lawyer.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...(search ? {
          OR: [
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { specialization: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        user: true,
        cases: {
          select: {
            id: true,
            status: true
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const lawyer = await prisma.lawyer.create({
      data: {
        user: {
          create: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            role: 'LAWYER',
            status: 'ACTIVE'
          }
        },
        employeeId: data.employeeId,
        department: data.department,
        academicRank: data.academicRank,
        specialization: data.specialization,
        maxCaseload: parseInt(data.maxCaseload),
        availabilityHours: data.availabilityHours,
        yearsOfExperience: parseInt(data.yearsOfExperience),
        teachingSchedule: data.teachingSchedule,
        certifications: data.certifications,
        bio: data.bio
      }
    });

    return NextResponse.json(lawyer);
  } catch (error) {
    console.error('Error creating lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to create lawyer' },
      { status: 500 }
    );
  }
} 