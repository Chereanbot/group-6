import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { WorkStatus } from "@prisma/client";

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id') || '';
    const userRole = headersList.get('x-user-role') || '';

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access case summaries' },
        { status: 403 }
      );
    }

    // Get all cases for the lawyer with related data
    const cases = await prisma.case.findMany({
      where: { 
        lawyerId: userId
      },
      include: {
        assignedLawyer: true,
        client: true,
        documents: true,
        timeEntries: true,
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
          },
        },
        workAssignments: {
          select: {
            complexity: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Process and transform the data
    const caseSummaries = cases.map(caseItem => {
      // Calculate total billable amount from time entries
      const totalBillable = caseItem.timeEntries?.reduce((sum, entry) => {
        return sum + (entry.duration / 3600) * (entry.rate || 0);
      }, 0) || 0;

      // Calculate case duration
      const duration = caseItem.resolvedAt
        ? Math.round((new Date(caseItem.resolvedAt).getTime() - new Date(caseItem.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : Math.round((new Date().getTime() - new Date(caseItem.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      // Get complexity from work assignments
      const complexity = caseItem.workAssignments?.find(wa => wa.status === WorkStatus.IN_PROGRESS)?.complexity || 0;

      return {
        id: caseItem.id,
        title: caseItem.title,
        status: caseItem.status,
        category: caseItem.category,
        priority: caseItem.priority,
        createdAt: caseItem.createdAt,
        resolvedAt: caseItem.resolvedAt,
        client: {
          name: caseItem.client?.fullName || 'N/A',
          email: caseItem.client?.email || 'N/A',
        },
        duration: duration,
        complexity: complexity,
        billing: {
          totalBillable: Math.round(totalBillable),
          totalHours: Math.round(caseItem.timeEntries?.reduce((sum, entry) => sum + entry.duration / 3600, 0) || 0),
        },
        metrics: {
          documentCount: caseItem.documents?.length || 0,
          activityCount: caseItem.activities?.length || 0,
          averageRating: 0, // Rating is not available in the current schema
        },
        recentActivities: (caseItem.activities || []).map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          date: activity.createdAt,
        })),
        documents: (caseItem.documents || []).map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          date: doc.uploadedAt,
        })),
      };
    });

    // Calculate summary statistics
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'ACTIVE').length;
    const resolvedCases = cases.filter(c => c.status === 'RESOLVED').length;
    const totalBillable = cases.reduce((sum, c) => {
      return sum + (c.timeEntries?.reduce((s, e) => s + (e.duration / 3600) * (e.rate || 0), 0) || 0);
    }, 0);

    // Calculate average complexity from active work assignments
    const avgComplexity = cases.reduce((sum, c) => {
      const complexity = c.workAssignments?.find(wa => wa.status === WorkStatus.IN_PROGRESS)?.complexity || 0;
      return sum + Number(complexity);
    }, 0) / totalCases;

    return NextResponse.json({
      summary: {
        totalCases,
        activeCases,
        resolvedCases,
        totalBillable: Math.round(totalBillable),
        averageComplexity: avgComplexity,
      },
      cases: caseSummaries,
    });
  } catch (error) {
    console.error("[CASE_SUMMARY_REPORT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 