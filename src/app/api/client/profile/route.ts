import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, Gender, HealthStatus, CaseType, CaseCategory, Prisma } from "@prisma/client";
import { translateToAmharic } from "@/utils/translations";
import { type RequestCookies } from "next/dist/server/web/spec-extension/cookies";

const profileInclude = {
  user: {
    select: {
      fullName: true,
      email: true,
      phone: true,
      status: true
    }
  },
  assignedOffice: {
    include: {
      coordinators: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      },
      lawyers: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true
            }
          },
          specializations: {
            include: {
              specialization: true
            }
          }
        }
      }
    }
  }
} as const;

type ProfileWithIncludes = Prisma.ClientProfileGetPayload<{
  include: typeof profileInclude;
}>;

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    // First get the user to ensure we have all required data
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("User not found") },
        { status: 404 }
      );
    }

    // Get or create the client's profile
    let profile = await prisma.clientProfile.findUnique({
      where: {
        userId: payload.id
      },
      include: profileInclude
    });

    if (!profile) {
      // Get default office for new clients
      const defaultOffice = await prisma.office.findFirst({
        where: { status: 'ACTIVE' }
      });

      if (!defaultOffice) {
        return NextResponse.json(
          { success: false, message: translateToAmharic("No active office found") },
          { status: 400 }
        );
      }

      // Create a default profile
      profile = await prisma.clientProfile.create({
        data: {
          userId: user.id,
          age: 0,
          sex: Gender.OTHER,
          phone: user.phone || "",
          numberOfFamily: 1,
          healthStatus: HealthStatus.HEALTHY,
          region: "Addis Ababa", // Default value
          zone: "Not Specified",
          wereda: "Not Specified",
          kebele: "Not Specified",
          caseType: CaseType.OTHER,
          caseCategory: CaseCategory.OTHER,
          guidelines: [],
          officeId: defaultOffice.id
        },
        include: profileInclude
      });
    }

    // Get the cases separately since they're not directly related to ClientProfile
    const cases = await prisma.case.findMany({
      where: {
        clientId: payload.id
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        office: profile.assignedOffice ? {
          ...profile.assignedOffice,
          cases
        } : null
      }
    });
  } catch (error) {
    console.error("Error fetching/creating client profile:", error);
    return NextResponse.json(
      { success: false, message: translateToAmharic("Failed to fetch profile") },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Update client profile
    const profile = await prisma.clientProfile.update({
      where: {
        userId: payload.id
      },
      data: {
        phone: data.phone,
        healthStatus: data.healthStatus,
        houseNumber: data.houseNumber,
        notes: data.notes
      },
      include: profileInclude
    });

    // Get the cases separately since they're not directly related to ClientProfile
    const cases = await prisma.case.findMany({
      where: {
        clientId: payload.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Construct the response with the correct structure
    const responseData = {
      ...profile,
      office: profile.assignedOffice ? {
        ...profile.assignedOffice,
        cases
      } : null
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error updating client profile:", error);
    return NextResponse.json(
      { success: false, message: translateToAmharic("Failed to update profile") },
      { status: 500 }
    );
  }
} 