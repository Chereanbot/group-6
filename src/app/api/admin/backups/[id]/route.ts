import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get backup details
    const backup = await prisma.backup.findUnique({
      where: { id: params.id }
    });

    if (!backup) {
      return NextResponse.json(
        { success: false, message: "Backup not found" },
        { status: 404 }
      );
    }

    // Delete the backup file if it exists
    if (backup.path) {
      try {
        const fullPath = path.join(process.cwd(), backup.path);
        await fs.access(fullPath);
        await fs.unlink(fullPath);
      } catch (error) {
        console.error('Error deleting backup file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete backup logs
    await prisma.backupLog.deleteMany({
      where: { backupId: params.id }
    });

    // Delete backup settings
    await prisma.backupSettings.deleteMany({
      where: { backupId: params.id }
    });

    // Delete backup record
    await prisma.backup.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 