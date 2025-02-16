import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const file = formData.get('avatar') as File;

    if (!userId || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const filename = `${userId}-${Date.now()}${path.extname(file.name)}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    const filepath = path.join(uploadDir, filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await writeFile(filepath, buffer);

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: `/uploads/avatars/${filename}`,
        updatedAt: new Date()
      },
      select: {
        id: true,
        avatar: true
      }
    });

    // Create activity log
    await prisma.userActivity.create({
      data: {
        userId,
        type: 'AVATAR_UPDATE',
        description: 'Profile avatar updated',
      }
    });

    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 