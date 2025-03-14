import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus, CaseStatus } from '@prisma/client';
import * as XLSX from 'xlsx';

interface LawyerWithRelations {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  lawyerProfile: {
    rating: number;
    office: {
      name: string;
    } | null;
    specializations: Array<{
      specialization: {
        name: string;
      };
    }>;
  } | null;
  assignedCases: Array<{
    id: string;
    status: CaseStatus;
    createdAt: Date;
    resolvedAt: Date | null;
    clientRating: number | null;
  }>;
}

export async function POST(req: Request) {
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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const filters = await req.json();
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

    // Get all lawyers with their cases and related data
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: filters.status === 'all' ? undefined : filters.status,
        lawyerProfile: {
          office: filters.office && filters.office !== 'all' ? {
            name: filters.office
          } : undefined,
          specializations: filters.specialization && filters.specialization !== 'all' ? {
            some: {
              specialization: {
                name: filters.specialization
              }
            }
          } : undefined
        }
      },
      include: {
        lawyerProfile: {
          include: {
            office: true,
            specializations: {
              include: {
                specialization: true
              }
            }
          }
        },
        assignedCases: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    }) as unknown as LawyerWithRelations[];

    // Transform data for Excel
    const reportData = lawyers.map(lawyer => {
      const totalCases = lawyer.assignedCases.length;
      const resolvedCases = lawyer.assignedCases.filter(c => c.status === CaseStatus.RESOLVED).length;
      const successRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

      // Calculate average resolution time
      const resolutionTimes = lawyer.assignedCases
        .filter(c => c.status === CaseStatus.RESOLVED && c.resolvedAt)
        .map(c => {
          const resolvedAt = new Date(c.resolvedAt!);
          const createdAt = new Date(c.createdAt);
          return Math.ceil((resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        });
      const averageResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
        : 0;

      // Calculate client satisfaction
      const ratings = lawyer.assignedCases
        .filter(c => c.clientRating !== null)
        .map(c => c.clientRating!);
      const clientSatisfaction = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      return {
        'Lawyer Name': lawyer.fullName,
        'Email': lawyer.email,
        'Office': lawyer.lawyerProfile?.office?.name || 'Unassigned',
        'Specializations': lawyer.lawyerProfile?.specializations.map(s => s.specialization.name).join(', ') || 'None',
        'Status': lawyer.status,
        'Total Cases': totalCases,
        'Resolved Cases': resolvedCases,
        'Pending Cases': totalCases - resolvedCases,
        'Success Rate (%)': successRate.toFixed(1),
        'Avg. Resolution Time (days)': averageResolutionTime.toFixed(1),
        'Client Satisfaction': clientSatisfaction.toFixed(1),
        'Rating': lawyer.lawyerProfile?.rating || 0
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Add column widths
    const colWidths = [
      { wch: 20 }, // Lawyer Name
      { wch: 25 }, // Email
      { wch: 15 }, // Office
      { wch: 30 }, // Specializations
      { wch: 10 }, // Status
      { wch: 12 }, // Total Cases
      { wch: 12 }, // Resolved Cases
      { wch: 12 }, // Pending Cases
      { wch: 15 }, // Success Rate
      { wch: 20 }, // Avg. Resolution Time
      { wch: 15 }, // Client Satisfaction
      { wch: 10 }  // Rating
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Lawyer Reports');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as Excel file
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=lawyer-reports-${filters.period}-${filters.startDate}-${filters.endDate}.xlsx`
      }
    });

  } catch (error) {
    console.error('Error exporting reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to export reports',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 