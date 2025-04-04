import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, PerformanceCategory } from '@prisma/client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

// Validation schema for performance data
const performanceSchema = z.object({
  officeId: z.string().min(1, "Office ID is required"),
  category: z.nativeEnum(PerformanceCategory),
  metric: z.string(),
  value: z.number(),
  period: z.string(),
  targetValue: z.number().optional(),
  description: z.string().optional(),
});

type PerformanceData = z.infer<typeof performanceSchema>;

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

    const performances = await prisma.officePerformance.findMany({
      include: {
        office: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: performances });
  } catch (error) {
    console.error('Failed to fetch office performances:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch office performances" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    
    // Validate the request body
    const validatedData = performanceSchema.parse(body);
    const { officeId, category, metric, value, period, targetValue, description } = validatedData;

    // Check if office exists
    const office = await prisma.office.findUnique({
      where: { id: officeId }
    });

    if (!office) {
      return NextResponse.json(
        { success: false, message: "Office not found" },
        { status: 404 }
      );
    }

    const performance = await prisma.officePerformance.create({
      data: {
        office: {
          connect: {
            id: officeId
          }
        },
        category,
        metric,
        value,
        period,
        targetValue,
        description,
        date: new Date()
      },
      include: {
        office: {
          select: {
            id: true,
            name: true,
            location: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: performance });
  } catch (error) {
    console.error('Failed to create office performance:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create office performance" },
      { status: 500 }
    );
  }
} 