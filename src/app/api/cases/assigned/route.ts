import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const office = url.searchParams.get('office');
    const specialization = url.searchParams.get('specialization');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build the where clause for filtering
    const where: any = {
      assignedLawyerId: { not: null }, // Only get assigned cases
    };

    if (office) {
      where.assignedOfficeId = office;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { assignedLawyer: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (specialization) {
      where.assignedLawyer = {
        lawyerProfile: {
          specializations: {
            some: {
              specializationId: specialization
            }
          }
        }
      };
    }

    // Fetch assigned cases with related data
    const cases = await prisma.case.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            lawyerProfile: {
              include: {
                office: true,
                specializations: {
                  include: {
                    specialization: true,
                  },
                },
              },
            },
          },
        },
        assignedOffice: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        cases,
      },
    });
  } catch (error) {
    console.error('Error fetching assigned cases:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 