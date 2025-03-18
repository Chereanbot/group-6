import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UserRoleEnum, CaseStatus, Priority } from "@prisma/client";

// Function to check if a lawyer needs update
function needsUpdate(lastUpdateDate: Date | null): boolean {
  if (!lastUpdateDate) return true;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return lastUpdateDate < thirtyDaysAgo;
}

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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all lawyer profiles with related data
    const lawyerProfiles = await prisma.lawyerProfile.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            status: true,
            phone: true,
          },
        },
        office: true,
        specializations: {
          include: {
            specialization: true,
          },
        },
      },
    });

    // Transform and enrich the data
    const transformedData = await Promise.all(
      lawyerProfiles.map(async (lawyer) => {
        // Get case statistics with assignment dates
        const cases = await prisma.case.findMany({
          where: {
            lawyerId: lawyer.userId,
          },
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Filter cases by different time periods using createdAt
        const activeCases = cases.filter(
          (c) => c.status !== CaseStatus.RESOLVED && c.status !== CaseStatus.CANCELLED
        );

        const last30DaysCases = cases.filter(
          (c) => new Date(c.createdAt) > thirtyDaysAgo
        );

        const last60DaysCases = cases.filter(
          (c) => new Date(c.createdAt) > sixtyDaysAgo
        );

        const last90DaysCases = cases.filter(
          (c) => new Date(c.createdAt) > ninetyDaysAgo
        );

        const highPriorityCases = cases.filter(
          (c) => c.priority === Priority.HIGH || c.priority === Priority.URGENT
        );

        const recentCases = cases.filter(
          (c) => new Date(c.createdAt) > thirtyDaysAgo
        );

        // Get assignments with dates
        const assignments = await prisma.caseAssignment.findMany({
          where: {
            assignedToId: lawyer.userId,
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const activeAssignments = assignments.filter(a => a.status === "ACCEPTED").length;
        const completedAssignments = assignments.filter(a => a.status === "COMPLETED").length;

        const completedCases = cases.filter(c => c.status === CaseStatus.RESOLVED);

        // Calculate metrics
        const utilizationRate = (activeCases.length / 10) * 100;
        const efficiency = cases.length > 0
          ? (completedCases.length / cases.length) * 100
          : 0;

        const avgResponseTime = completedCases.length > 0
          ? completedCases.reduce((acc, c) => {
              const duration = new Date(c.createdAt).getTime() - new Date().getTime();
              return acc + Math.abs(Math.floor(duration / (1000 * 60 * 60 * 24)));
            }, 0) / completedCases.length
          : 0;

        // Check if lawyer needs update
        const needsProfileUpdate = needsUpdate(lawyer.updatedAt);

        // If needs update, trigger automatic update
        if (needsProfileUpdate) {
          await prisma.lawyerProfile.update({
            where: { id: lawyer.id },
            data: {
              rating: calculateNewRating(efficiency, avgResponseTime),
              updatedAt: new Date(),
              caseLoad: activeCases.length,
            },
          });
        }

        return {
          id: lawyer.id,
          fullName: lawyer.user.fullName,
          email: lawyer.user.email,
          status: lawyer.user.status,
          phoneNumber: lawyer.user.phone,
          lastActive: new Date(),
          office: lawyer.office.name,
          officeLocation: lawyer.office.location,
          experience: lawyer.experience,
          specializations: lawyer.specializations.map(
            (s) => s.specialization.name
          ),
          totalCases: cases.length,
          activeCases: activeCases.length,
          last30DaysCases: last30DaysCases.length,
          last60DaysCases: last60DaysCases.length,
          last90DaysCases: last90DaysCases.length,
          highPriorityCases: highPriorityCases.length,
          recentCases: recentCases.length,
          completedCases: completedCases.length,
          activeAssignments,
          completedAssignments,
          rating: lawyer.rating,
          caseLoad: activeCases.length,
          utilizationRate,
          efficiency,
          avgResponseTime,
          yearsOfPractice: lawyer.yearsOfPractice,
          barAdmissionDate: lawyer.barAdmissionDate,
          languages: lawyer.languages,
          certifications: lawyer.certifications,
          lastUpdatedAt: lawyer.updatedAt,
          needsUpdate: needsProfileUpdate,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error in lawyer workload GET route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch workload data" },
      { status: 500 }
    );
  }
}

function calculateNewRating(efficiency: number, avgResponseTime: number): number {
  // Base rating calculation
  let rating = 5; // Start with max rating

  // Deduct points based on efficiency
  if (efficiency < 90) rating -= 0.5;
  if (efficiency < 80) rating -= 0.5;
  if (efficiency < 70) rating -= 0.5;
  if (efficiency < 60) rating -= 0.5;

  // Deduct points based on response time
  if (avgResponseTime > 7) rating -= 0.5;  // More than a week
  if (avgResponseTime > 14) rating -= 0.5; // More than two weeks
  if (avgResponseTime > 21) rating -= 0.5; // More than three weeks
  if (avgResponseTime > 28) rating -= 0.5; // More than four weeks

  // Ensure rating stays within bounds
  return Math.max(1, Math.min(5, rating));
}

function calculateUtilizationRate(caseCount: number, experience: number): number {
  // Assuming a lawyer with X years of experience can handle X*5 cases efficiently
  const expectedCapacity = experience * 5;
  return Math.min((caseCount / expectedCapacity) * 100, 100);
}

function calculateEfficiency(completedCases: number, totalCases: number): number {
  if (totalCases === 0) return 0;
  return (completedCases / totalCases) * 100;
} 