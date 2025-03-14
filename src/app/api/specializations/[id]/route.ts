import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const data = await req.json();

    if (!data.name || !data.category) {
      return NextResponse.json(
        { success: false, message: "Name and category are required" },
        { status: 400 }
      );
    }

    // Check if another specialization with the same name exists (excluding current one)
    const existingSpecialization = await prisma.legalSpecialization.findFirst({
      where: {
        name: data.name,
        NOT: {
          id: params.id
        }
      }
    });

    if (existingSpecialization) {
      return NextResponse.json(
        { success: false, message: "Another specialization with this name already exists" },
        { status: 400 }
      );
    }

    // Update the specialization
    const specialization = await prisma.legalSpecialization.update({
      where: {
        id: params.id
      },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        subFields: data.subFields || []
      }
    });

    return NextResponse.json({
      success: true,
      data: specialization
    });

  } catch (error) {
    console.error('Error updating specialization:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update specialization',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if specialization is being used by any lawyers
    const usedByLawyers = await prisma.lawyerSpecialization.findFirst({
      where: {
        specializationId: params.id
      }
    });

    if (usedByLawyers) {
      return NextResponse.json(
        { success: false, message: "Cannot delete specialization as it is being used by lawyers" },
        { status: 400 }
      );
    }

    // Delete the specialization
    await prisma.legalSpecialization.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Specialization deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting specialization:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete specialization',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 