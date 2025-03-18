import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus } from '@prisma/client';

export async function GET(
  request: Request,
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

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { userId: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            status: true,
            userRole: true
          }
        },
        office: true,
        specializations: {
          include: {
            specialization: true
          }
        }
      }
    });

    if (!lawyer) {
      return NextResponse.json(
        { success: false, message: "Lawyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lawyer
    });

  } catch (error) {
    console.error('Error fetching lawyer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch lawyer',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const data = await request.json();

    // Validate required fields
    const requiredFields = {
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      officeName: "Office Name"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !data[field])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields", 
          details: `Please provide: ${missingFields.join(", ")}`
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email exists and belongs to another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: params.id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // Validate phone number format (assuming Ethiopian format)
    const phoneRegex = /^\+251[0-9]{9}$/;
    if (!phoneRegex.test(data.phone)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid phone number format", 
          details: "Phone number should be in Ethiopian format: +251xxxxxxxxx"
        },
        { status: 400 }
      );
    }

    // Find office by name
    const office = await prisma.office.findUnique({
      where: { name: data.officeName }
    });

    if (!office) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Office not found",
          details: `No office found with name "${data.officeName}"`
        },
        { status: 404 }
      );
    }

    // First check if the lawyer profile exists
    const existingProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: params.id }
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, message: "Lawyer profile not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: params.id },
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone
        }
      });

      // Update lawyer profile
      const lawyer = await tx.lawyerProfile.update({
        where: { userId: params.id },
        data: {
          experience: data.yearsOfExperience || 0,
          officeId: office.id,
          specializations: {
            deleteMany: {},
            create: (data.specializations || []).map((spec: string) => ({
              specialization: {
                connectOrCreate: {
                  where: { name: spec },
                  create: {
                    name: spec,
                    category: 'GENERAL',
                    description: `Specialization in ${spec}`
                  }
                }
              },
              yearsExperience: data.yearsOfExperience || 0,
              isMainFocus: true
            }))
          },
          yearsOfPractice: data.yearsOfExperience || 0,
          barAdmissionDate: data.barAdmissionDate ? new Date(data.barAdmissionDate) : null,
          primaryJurisdiction: data.primaryJurisdiction || null,
          languages: data.languages || [],
          certifications: data.certifications || [],
          availability: true,
          caseLoad: existingProfile.caseLoad || 0,
          rating: existingProfile.rating || 0
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
              userRole: true
            }
          },
          office: true,
          specializations: {
            include: {
              specialization: true
            }
          }
        }
      });

      return lawyer;
    });

    return NextResponse.json({
      success: true,
      message: "Lawyer profile updated successfully",
      data: result
    });

  } catch (error) {
    console.error('Error updating lawyer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update lawyer',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 