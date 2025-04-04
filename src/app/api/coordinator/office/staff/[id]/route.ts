import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/coordinator/office/staff/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, email, phone, specialization } = body;

    // Verify staff member belongs to coordinator's office
    const staff = await prisma.staff.findFirst({
      where: {
        id: params.id,
        office: {
          coordinatorId: session.user.id
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: { id: staff.userId },
      data: {
        name,
        email,
        phone
      }
    });

    // Update staff member
    const updatedStaff = await prisma.staff.update({
      where: { id: params.id },
      data: {
        role,
        specializations: {
          deleteMany: {},
          create: specialization.map((name: string) => ({
            name
          }))
        }
      },
      include: {
        performance: true,
        specializations: true
      }
    });

    return NextResponse.json({
      success: true,
      staff: {
        id: updatedStaff.id,
        name: updatedUser.name,
        role: updatedStaff.role,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedStaff.status,
        joinDate: updatedStaff.createdAt,
        performance: updatedStaff.performance,
        specialization: updatedStaff.specializations.map(s => s.name)
      }
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/coordinator/office/staff/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Verify staff member belongs to coordinator's office
    const staff = await prisma.staff.findFirst({
      where: {
        id: params.id,
        office: {
          coordinatorId: session.user.id
        }
      }
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Delete staff member and associated data
    await prisma.staff.delete({
      where: { id: params.id }
    });

    // Delete user account
    await prisma.user.delete({
      where: { id: staff.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
} 