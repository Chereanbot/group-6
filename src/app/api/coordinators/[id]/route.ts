import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get single coordinator
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const coordinator = await prisma.coordinator.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            status: true
          }
        },
        office: true,
        qualifications: true
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(coordinator);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch coordinator' },
      { status: 500 }
    );
  }
}

// Update coordinator
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    // First update user
    const coordinator = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: data.userId },
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone
        }
      });

      // Then update coordinator
      const updatedCoordinator = await tx.coordinator.update({
        where: { id: params.id },
        data: {
          type: data.type,
          officeId: data.officeId,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          specialties: data.specialties,
          status: data.status,
          // Update qualifications
          qualifications: {
            deleteMany: {},
            create: data.qualifications.map((qual: any) => ({
              type: qual.type,
              title: qual.title,
              institution: qual.institution,
              dateObtained: new Date(qual.dateObtained),
              expiryDate: qual.expiryDate ? new Date(qual.expiryDate) : null,
              score: qual.score ? parseFloat(qual.score) : null
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
              role: true,
              status: true
            }
          },
          qualifications: true,
          office: true
        }
      });

      return updatedCoordinator;
    });

    return NextResponse.json({ success: true, data: coordinator });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update coordinator' },
      { status: 500 }
    );
  }
}

// Delete coordinator
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete in transaction to ensure both records are deleted
    await prisma.$transaction(async (tx) => {
      const coordinator = await tx.coordinator.findUnique({
        where: { id: params.id },
        select: { userId: true }
      });

      if (!coordinator) {
        throw new Error('Coordinator not found');
      }

      // Delete coordinator first (due to foreign key constraint)
      await tx.coordinator.delete({
        where: { id: params.id }
      });

      // Then delete user
      await tx.user.delete({
        where: { id: coordinator.userId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete coordinator' },
      { status: 500 }
    );
  }
} 