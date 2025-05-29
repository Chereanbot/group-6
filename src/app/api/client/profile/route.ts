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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user profile with all necessary details
    const userProfile = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        clientProfile: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    // Transform the data to include all necessary information
    const profileData = {
      id: userProfile.id,
      fullName: userProfile.fullName,
      email: userProfile.email,
      phone: userProfile.clientProfile?.phone || userProfile.phone,
      address: {
        region: userProfile.clientProfile?.region || '',
        zone: userProfile.clientProfile?.zone || '',
        wereda: userProfile.clientProfile?.wereda || '',
        kebele: userProfile.clientProfile?.kebele || '',
        houseNumber: userProfile.clientProfile?.houseNumber || ''
      },
      preferredLanguage: 'English', // Default to English as it's not in the schema
      status: userProfile.status
    };

    return NextResponse.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
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

    // Update client profile, now including address fields
    const profile = await prisma.clientProfile.update({
      where: {
        userId: payload.id
      },
      data: {
        phone: data.phone,
        healthStatus: data.healthStatus,
        houseNumber: data.houseNumber,
        notes: data.notes,
        region: data.region,
        zone: data.zone,
        wereda: data.wereda,
        kebele: data.kebele
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