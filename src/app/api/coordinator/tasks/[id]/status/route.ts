import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('token=')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const verified = await verifyAuth(token);
    if (!verified || verified.role !== 'COORDINATOR') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update task status
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { coordinatorId: true }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify task ownership
    if (task.coordinatorId !== verified.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this task' },
        { status: 403 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status,
        progress: status === 'COMPLETED' ? 100 : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Task status updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
} 