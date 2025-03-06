import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { UserRoleEnum } from "@prisma/client";

export async function GET() {
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
    
        if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
          return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
          );
        }

    // Fetch waiting cases for the client
    const waitingCases = await prisma.case.findMany({
      where: {
        clientId: user.id,
        status: "PENDING", // Only get pending cases
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        category: true,
        description: true,
        assignedOffice: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the cases for the frontend
    const formattedCases = waitingCases.map(case_ => ({
      id: case_.id,
      title: case_.title,
      status: case_.status,
      submittedAt: case_.createdAt.toISOString(),
      category: case_.category,
      description: case_.description,
      targetOffice: case_.assignedOffice?.name || null
    }));

    return NextResponse.json(formattedCases);
  } catch (error) {
    console.error('Error fetching waiting cases:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch waiting cases" },
      { status: 500 }
    );
  }
} 