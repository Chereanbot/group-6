import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication and coordinator role
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    // Fetch recent work assignments with proper error handling
    try {
      const tasks = await prisma.workAssignment.findMany({
        where: {
          lawyerId: authResult.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          case: {
            select: {
              title: true,
              category: true
            }
          }
        }
      });

      // Transform tasks data
      const transformedTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        progress: task.progress,
        type: task.type,
        complexity: task.complexity,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours || 0,
        caseTitle: task.case?.title || null,
        caseCategory: task.case?.category || null
      }));

      return NextResponse.json({ 
        success: true,
        tasks: transformedTasks 
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 401 }
    );
  }
} 