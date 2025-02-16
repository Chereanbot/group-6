import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kebeleId = searchParams.get('kebeleId');

    if (!kebeleId) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    // Get all cases for the kebele
    const cases = await prisma.case.findMany({
      where: { kebeleId },
      include: {
        kebeleApproval: true
      }
    });

    // Get total residents count
    const totalResidents = await prisma.resident.count({
      where: { kebeleId }
    });

    // Calculate case statistics
    const totalCases = cases.length;
    const pendingCases = cases.filter(c => !c.kebeleApproval).length;
    const approvedCases = cases.filter(c => c.kebeleApproval?.approved).length;
    const rejectedCases = cases.filter(c => c.kebeleApproval?.approved === false).length;

    // Calculate cases by month for the last 6 months
    const today = new Date();
    const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6));
    
    const casesByMonth = await prisma.case.groupBy({
      by: ['createdAt'],
      where: {
        kebeleId,
        createdAt: {
          gte: sixMonthsAgo
        }
      }
    });

    // Format cases by month
    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${month} ${year}`;

      const monthCases = cases.filter(c => {
        const caseDate = new Date(c.createdAt);
        return caseDate.getMonth() === date.getMonth() && 
               caseDate.getFullYear() === date.getFullYear();
      });

      return {
        month: monthKey,
        pending: monthCases.filter(c => !c.kebeleApproval).length,
        approved: monthCases.filter(c => c.kebeleApproval?.approved).length,
        rejected: monthCases.filter(c => c.kebeleApproval?.approved === false).length
      };
    }).reverse();

    return NextResponse.json({
      totalCases,
      pendingCases,
      approvedCases,
      rejectedCases,
      totalResidents,
      casesByMonth: monthlyStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 