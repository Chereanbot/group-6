import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { CaseStatus } from "@prisma/client";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access their cases' },
        { status: 403 }
      );
    }

    // Fetch cases assigned to the lawyer
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: userId,
        // Filter out resolved cases
        status: {
          not: CaseStatus.RESOLVED
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        priority: true,
        client: {
          select: {
            fullName: true
          }
        },
        clientName: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include client name in the case title
    const formattedCases = cases.map(case_ => ({
      id: case_.id,
      title: `${case_.title} (${case_.clientName})`,
      status: case_.status,
      category: case_.category,
      priority: case_.priority
    }));

    return NextResponse.json({
      cases: formattedCases
    });
  } catch (error) {
    console.error("[LAWYER_CASES]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}