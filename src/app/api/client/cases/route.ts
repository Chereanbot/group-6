import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum } from "@prisma/client";

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

    // Get all cases for the client
    const cases = await prisma.case.findMany({
      where: {
        clientId: payload.id
      },
      include: {
        assignedLawyer: {
          include: {
            lawyerProfile: {
              include: {
                specializations: {
                  include: {
                    specialization: true
                  }
                }
              }
            }
          }
        },
        client: true,
        caseEvents: true,
        documents: {
          include: {
            uploader: true
          }
        },
        activities: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error("Error fetching client cases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cases" },
      { status: 500 }
    );
  }
} 