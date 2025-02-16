import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { status } = await request.json();
    const { userId } = params;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user status' },
      { status: 500 }
    );
  }
} 