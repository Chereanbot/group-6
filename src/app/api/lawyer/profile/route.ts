import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        specializations: {
          include: {
            specialization: true
          }
        }
      }
    });

    if (!lawyer) {
      return NextResponse.json(
        { error: "Lawyer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      specializations: lawyer.specializations.map(spec => ({
        id: spec.specializationId,
        name: spec.specialization.name,
        category: spec.specialization.category,
        yearsExperience: spec.yearsExperience,
        isMainFocus: spec.isMainFocus
      }))
    });

  } catch (error) {
    console.error('Failed to fetch lawyer profile:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 