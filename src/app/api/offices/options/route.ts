import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

interface OfficeOption {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface PerformanceOption {
  id: string;
  metric: string;
  value: number;
  period: string;
  targetValue: number | null;
  description: string | null;
  date: Date;
}

interface OptionsResponse {
  offices: OfficeOption[];
  performances: PerformanceOption[];
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

    const [offices, performances] = await Promise.all([
      prisma.office.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          status: true,
        },
        where: {
          status: 'ACTIVE'
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.officePerformance.findMany({
        select: {
          id: true,
          metric: true,
          value: true,
          period: true,
          targetValue: true,
          description: true,
          date: true,
        },
        orderBy: {
          date: 'desc'
        },
        take: 10 // Get the 10 most recent performance records
      })
    ]);

    const response: OptionsResponse = {
      offices: offices as OfficeOption[],
      performances: performances as PerformanceOption[]
    };

    return NextResponse.json({ 
      success: true, 
      data: response
    });
  } catch (error) {
    console.error('Failed to fetch options:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch options" },
      { status: 500 }
    );
  }
} 