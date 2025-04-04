import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/coordinator/office/staff
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      where: {
        office: {
          coordinatorId: session.user.id
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        performance: true,
        specializations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      staff: staff.map(member => ({
        id: member.id,
        name: member.user.name,
        role: member.role,
        email: member.user.email,
        phone: member.user.phone,
        status: member.status,
        joinDate: member.createdAt,
        performance: member.performance,
        specialization: member.specializations.map(s => s.name)
      }))
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

// POST /api/coordinator/office/staff
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, email, phone, specialization } = body;

    // Create user account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: 'STAFF',
        password: '', // Will be set by the user through email invitation
        status: 'PENDING'
      }
    });

    // Create staff member
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        role,
        status: 'ACTIVE',
        office: {
          connect: {
            coordinatorId: session.user.id
          }
        },
        specializations: {
          create: specialization.map((name: string) => ({
            name
          }))
        },
        performance: {
          create: {
            efficiency: 0,
            attendance: 100,
            casesHandled: 0
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: user.name,
        role: staff.role,
        email: user.email,
        phone: user.phone,
        status: staff.status,
        joinDate: staff.createdAt,
        performance: staff.performance,
        specialization: staff.specializations.map(s => s.name)
      }
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create staff member' },
      { status: 500 }
    );
  }
} 