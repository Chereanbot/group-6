import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

// Helper function to verify admin authorization
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        office: true,
        qualifications: true
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { coordinator }
    });
  } catch (error) {
    console.error('Error fetching coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coordinator' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, type, officeId, startDate, endDate, specialties, status, qualifications } = body;

    const coordinator = await prisma.coordinator.update({
      where: { id: params.id },
      data: {
        type,
        office: {
          connect: { id: officeId }
        },
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        specialties,
        status,
        user: {
          update: {
            fullName,
            email,
            phone
          }
        },
        qualifications: {
          deleteMany: {},
          create: qualifications.map((q: any) => ({
            type: q.type,
            title: q.title,
            institution: q.institution,
            dateObtained: new Date(q.dateObtained),
            expiryDate: q.expiryDate ? new Date(q.expiryDate) : null,
            score: q.score
          }))
        }
      },
      include: {
        user: true,
        office: true,
        qualifications: true
      }
    });

    return NextResponse.json({
      success: true,
      data: { coordinator }
    });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coordinator' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await prisma.coordinator.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Coordinator deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coordinator' },
      { status: 500 }
    );
  }
} 