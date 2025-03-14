import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated } = await verifyAuth(token);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all specializations with their relationships
    const specializations = await prisma.legalSpecialization.findMany({
      include: {
        lawyers: {
          include: {
            lawyer: true
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      total: specializations.length,
      byCategory: {} as { [key: string]: number },
      topUsed: [] as { name: string; count: number }[],
      averageSubFields: 0,
      totalLawyers: 0
    };

    // Calculate category distribution and lawyer counts
    specializations.forEach(spec => {
      // Category count
      stats.byCategory[spec.category] = (stats.byCategory[spec.category] || 0) + 1;

      // Lawyer count for this specialization
      const lawyerCount = spec.lawyers.length;
      stats.totalLawyers += lawyerCount;

      // Add to top used array
      stats.topUsed.push({
        name: spec.name,
        count: lawyerCount
      });

      // Add to subfields average
      stats.averageSubFields += spec.subFields.length;
    });

    // Calculate average subfields
    stats.averageSubFields = stats.averageSubFields / (specializations.length || 1);

    // Sort top used specializations
    stats.topUsed.sort((a, b) => b.count - a.count);
    stats.topUsed = stats.topUsed.slice(0, 5); // Keep only top 5

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching specialization stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 