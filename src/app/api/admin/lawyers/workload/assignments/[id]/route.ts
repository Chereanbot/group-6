import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Get assignment with related data
    const assignment = await prisma.workAssignment.findUnique({
      where: { id },
      include: {
        lawyer: {
          include: {
            profile: true,
          },
        },
        case: true,
      },
    });

    if (!assignment) {
      return new NextResponse('Assignment not found', { status: 404 });
    }

    return NextResponse.json({
      data: assignment,
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, priority, complexity, notes } = body;

    // Get existing assignment
    const existingAssignment = await prisma.workAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return new NextResponse('Assignment not found', { status: 404 });
    }

    // Update assignment
    const assignment = await prisma.workAssignment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(complexity && { complexity }),
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
      include: {
        lawyer: {
          include: {
            profile: true,
          },
        },
        case: true,
      },
    });

    return NextResponse.json({
      data: assignment,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Get existing assignment
    const existingAssignment = await prisma.workAssignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return new NextResponse('Assignment not found', { status: 404 });
    }

    // Delete assignment
    await prisma.workAssignment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 