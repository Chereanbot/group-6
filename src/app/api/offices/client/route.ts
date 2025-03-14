import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, OfficeType, Prisma } from "@prisma/client";

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

    // Get client's profile to check their region
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: payload.id },
      select: { region: true }
    });

    // Fetch offices based on client's region
    const offices = await prisma.office.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { type: OfficeType.HEADQUARTERS }, // Include headquarters
          ...(clientProfile?.region ? [{
            type: OfficeType.BRANCH,
            address: {
              contains: clientProfile.region
            }
          }] : [])
        ]
      },
      include: {
        coordinators: {
          where: {
            status: 'ACTIVE',
            user: {
              status: 'ACTIVE'
            }
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Transform the data to include coordinator information
    const transformedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.location,
      type: office.type,
      address: office.address,
      contactEmail: office.contactEmail,
      contactPhone: office.contactPhone,
      coordinators: office.coordinators.map(coord => ({
        id: coord.id,
        fullName: coord.user.fullName,
        email: coord.user.email,
        phone: coord.user.phone,
        type: coord.type,
        specialties: coord.specialties || [],
        status: coord.status
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedOffices
    });

  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch offices" },
      { status: 500 }
    );
  }
} 