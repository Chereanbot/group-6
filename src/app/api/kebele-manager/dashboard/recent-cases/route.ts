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

    // Get the 10 most recent cases for the kebele
    const recentCases = await prisma.case.findMany({
      where: { kebeleId },
      include: {
        client: {
          select: {
            fullName: true
          }
        },
        kebeleApproval: {
          select: {
            approved: true,
            approvedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Format the cases with their status
    const formattedCases = recentCases.map(case_ => ({
      id: case_.id,
      title: case_.title,
      status: !case_.kebeleApproval ? 'PENDING' :
              case_.kebeleApproval.approved ? 'APPROVED' : 'REJECTED',
      createdAt: case_.createdAt,
      client: case_.client
    }));

    return NextResponse.json(formattedCases);
  } catch (error) {
    console.error('Error fetching recent cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent cases' },
      { status: 500 }
    );
  }
} 