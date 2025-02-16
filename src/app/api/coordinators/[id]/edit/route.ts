import { NextResponse } from 'next/server';
import { PrismaClient, CoordinatorStatus, CoordinatorType } from '@prisma/client';
import { EditCoordinatorRequest, EditCoordinatorResponse } from '@/types/coordinator';

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Get and validate the ID
    const { id } = context.params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator ID is required'
      }, { status: 400 });
    }

    const data = await req.json() as EditCoordinatorRequest;

    // Input validation
    if (!data.fullName?.trim() || !data.email?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Full name and email are required'
      }, { status: 400 });
    }

    // Validate coordinator exists
    const existingCoordinator = await prisma.coordinator.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingCoordinator) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator not found'
      }, { status: 404 });
    }

    try {
      // Update in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update user information
        await tx.user.update({
          where: { id: existingCoordinator.userId },
          data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone
          }
        });

        // Update coordinator profile
        const updatedCoordinator = await tx.coordinator.update({
          where: { id },
          data: {
            type: data.type,
            officeId: data.officeId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            specialties: data.specialties,
            status: data.status,
            qualifications: {
              deleteMany: {},
              create: data.qualifications.map(qual => ({
                type: qual.type,
                title: qual.title,
                institution: qual.institution,
                dateObtained: new Date(qual.dateObtained),
                expiryDate: qual.expiryDate ? new Date(qual.expiryDate) : null,
                score: qual.score ? parseFloat(qual.score.toString()) : null
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
            office: true,
            qualifications: true
          }
        });

        return updatedCoordinator;
      });

      const response: EditCoordinatorResponse = {
        success: true,
        data: result,
        message: 'Coordinator updated successfully'
      };

      return NextResponse.json(response);

    } catch (txError) {
      const errorMessage = txError instanceof Error ? txError.message : 'Database transaction failed';
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid request data';
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  } finally {
    await prisma.$disconnect();
  }
} 