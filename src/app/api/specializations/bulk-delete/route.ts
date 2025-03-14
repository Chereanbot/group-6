import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No specializations selected" },
        { status: 400 }
      );
    }

    // Check if any of the specializations are being used by lawyers
    const usedSpecializations = await prisma.lawyerSpecialization.findMany({
      where: {
        specializationId: {
          in: ids
        }
      },
      include: {
        specialization: true
      }
    });

    if (usedSpecializations.length > 0) {
      const usedNames = usedSpecializations.map(us => us.specialization.name).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete the following specializations as they are being used by lawyers: ${usedNames}` 
        },
        { status: 400 }
      );
    }

    // Delete the specializations
    await prisma.legalSpecialization.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} specializations`
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete specializations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 