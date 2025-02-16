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

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: session.user.id },
      include: { specializations: true }
    });

    if (!lawyer) {
      return NextResponse.json(
        { error: "Lawyer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      specializations: lawyer.specializations.map(spec => spec.name)
    });

  } catch (error) {
    console.error('Failed to fetch specializations:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 