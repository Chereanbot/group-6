import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { role } = await request.json();
    const { userId } = params;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        isAdmin: role === 'SUPER_ADMIN' || role === 'ADMIN'
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
} 