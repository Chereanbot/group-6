import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header or cookie
    const token = request.headers.get('authorization')?.split(' ')[1] ||
      request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify authentication
    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch SMS templates
    const templates = await prisma.smsTemplate.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        content: true,
        category: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS templates' },
      { status: 500 }
    );
  }
} 