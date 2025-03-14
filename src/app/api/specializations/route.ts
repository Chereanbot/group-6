import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated } = await verifyAuth(token);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all specializations with lawyer counts
    const specializations = await prisma.legalSpecialization.findMany({
      include: {
        lawyers: {
          include: {
            lawyer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    // Transform the data to include counts
    const transformedSpecializations = specializations.map(spec => ({
      id: spec.id,
      name: spec.name,
      category: spec.category,
      description: spec.description,
      subFields: spec.subFields,
      lawyerCount: spec.lawyers.length,
      activeLawyerCount: spec.lawyers.filter(l => l.lawyer.user.status === 'ACTIVE').length
    }));

    return NextResponse.json({
      success: true,
      data: transformedSpecializations
    });

  } catch (error) {
    console.error('Error fetching specializations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch specializations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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

    const data = await req.json();

    if (!data.name || !data.category) {
      return NextResponse.json(
        { success: false, message: "Name and category are required" },
        { status: 400 }
      );
    }

    // Check if specialization already exists
    const existingSpecialization = await prisma.legalSpecialization.findUnique({
      where: {
        name: data.name
      }
    });

    if (existingSpecialization) {
      return NextResponse.json(
        { success: false, message: "Specialization already exists" },
        { status: 400 }
      );
    }

    // Create new specialization
    const specialization = await prisma.legalSpecialization.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || `Specialization in ${data.name}`,
        subFields: data.subFields || []
      }
    });

    return NextResponse.json({
      success: true,
      data: specialization
    });

  } catch (error) {
    console.error('Error creating specialization:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create specialization',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 