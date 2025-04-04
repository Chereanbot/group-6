import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import { TemplateType, UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    const templates = await prisma.template.findMany({
      where: {
        createdBy: authResult.user.id,
        type: TemplateType.CASE
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      templates: templates.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, content, type } = body;

    if (!name || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Name, content, and type are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        type: TemplateType.CASE,
        createdBy: authResult.user.id,
        status: 'ACTIVE'
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 