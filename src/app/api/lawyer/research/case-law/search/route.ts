import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { query, filters } = await request.json();

    // Get lawyer's specializations
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

    // Get specialization IDs the lawyer has access to
    const lawyerSpecializations = lawyer.specializations.map(spec => ({
      id: spec.specializationId,
      category: spec.specialization.category
    }));

    // Build search query
    const searchResults = await prisma.caseLaw.findMany({
      where: {
        AND: [
          // Filter by lawyer's specializations
          {
            OR: lawyerSpecializations.map(spec => ({
              specializationId: spec.id
            }))
          },
          // Court filter
          filters.courts.length > 0 ? {
            court: {
              in: filters.courts
            }
          } : {},
          // Date filter
          filters.dateRange ? {
            date: {
              gte: new Date(filters.dateRange)
            }
          } : {},
          // Search query
          query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { summary: { contains: query, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      include: {
        specialization: true
      },
      orderBy: [
        { relevance: 'desc' },
        { date: 'desc' }
      ]
    });

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 