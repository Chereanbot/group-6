import { NextResponse } from 'next/server';
import { PrismaClient, CoordinatorStatus, UserStatus } from '@prisma/client';
import { BlockRequest, BlockResponse } from '@/types/coordinator';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reason } = (await req.json()) as BlockRequest;

    // Validate input
    if (!action || !reason?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Action and reason are required'
      }, { status: 400 });
    }

    // Validate coordinator exists
    const existingCoordinator = await prisma.coordinator.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!existingCoordinator) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator not found'
      }, { status: 404 });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Update coordinator status
        const updatedCoordinator = await tx.coordinator.update({
          where: { id: params.id },
          data: {
            status: action === 'block' ? CoordinatorStatus.SUSPENDED : CoordinatorStatus.INACTIVE,
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
            office: {
              select: {
                id: true,
                name: true,
                location: true
              }
            }
          }
        });

        // Create block record
        await tx.blockRecord.create({
          data: {
            userId: existingCoordinator.userId,
            action,
            reason,
            expiresAt: action === 'block' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
              : null
          }
        });

        // Update user status
        await tx.user.update({
          where: { id: existingCoordinator.userId },
          data: {
            status: action === 'block' ? UserStatus.SUSPENDED : UserStatus.BANNED
          }
        });

        return updatedCoordinator;
      });

      const response: BlockResponse = {
        success: true,
        data: result,
        message: `Coordinator has been ${action === 'block' ? 'blocked' : 'banned'} successfully`
      };

      return NextResponse.json(response);

    } catch (txError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update coordinator status'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request data'
    }, { status: 400 });
  }
} 