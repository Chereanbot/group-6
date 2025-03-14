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
            email: true,
            fullName: true,
            phone: true,
            status: true,
            userRole: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
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
      data: coordinator
    });

  } catch (error) {
    console.error('Error fetching coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'type', 'officeId', 'status'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Update coordinator in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: body.userId },
        data: {
          fullName: body.fullName,
          phone: body.phone
        }
      });

      // Update coordinator
      const coordinator = await tx.coordinator.update({
        where: { id: params.id },
        data: {
          type: body.type,
          officeId: body.officeId,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          specialties: body.specialties,
          status: body.status,
          qualifications: {
            deleteMany: {},
            create: body.qualifications.map((q: any) => ({
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
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              status: true,
              userRole: true
            }
          },
          office: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          qualifications: true
        }
      });

      return coordinator;
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error updating coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 