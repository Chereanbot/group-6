import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !body.userId || !body.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { userId, data } = body;

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      fullName: data.fullName,
      phone: data.phone,
      username: data.username,
      bio: data.bio,
      specializations: data.specializations || [],
      languages: data.languages || [],
      availability: data.availability,
      officeHours: data.officeHours,
      updatedAt: new Date(),
    };

    // If password is being updated
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateData.password = hashedPassword;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        username: true,
        role: true,
        bio: true,
        avatar: true,
        specializations: true,
        languages: true,
        availability: true,
        officeHours: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Create activity log
    await prisma.userActivity.create({
      data: {
        userId,
        type: 'PROFILE_UPDATE',
        description: 'Profile information updated',
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 