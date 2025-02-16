import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({
      success: false,
      error: 'Invalid coordinator ID'
    }, { status: 400 });
  }

  try {
    // First check if coordinator exists
    const coordinator = await prisma.coordinator.findUnique({
      where: { id },
      select: {
        userId: true,
        id: true
      }
    });

    if (!coordinator) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator not found'
      }, { status: 404 });
    }

    // Delete everything in a transaction with increased timeout
    await prisma.$transaction(async (tx) => {
      // Delete all related records in parallel
      await Promise.all([
        // Delete qualifications
        tx.qualification.deleteMany({
          where: { coordinatorId: id }
        }),

        // Delete documents
        tx.coordinatorDocument.deleteMany({
          where: { coordinatorId: id }
        }),

        // Delete assignments
        tx.coordinatorAssignment.deleteMany({
          where: { coordinatorId: id }
        }),

        // Delete projects
        tx.project.deleteMany({
          where: { coordinatorId: id }
        })
      ]);

      // Delete coordinator
      await tx.coordinator.delete({
        where: { id }
      });

      // Delete user
      await tx.user.delete({
        where: { id: coordinator.userId }
      });
    }, {
      timeout: 10000 // Increase timeout to 10 seconds
    });

    return NextResponse.json({
      success: true,
      message: 'Coordinator deleted successfully'
    });

  } catch (error) {
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2025':
          errorMessage = 'Record not found';
          break;
        case 'P2002':
          errorMessage = 'Unique constraint violation';
          break;
        default:
          errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: `Failed to delete coordinator: ${errorMessage}`
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
} 