import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createBackupJob, startBackup } from '@/lib/backup';
import { UserRoleEnum } from '@prisma/client';

// Middleware to check admin authorization
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized: Please login');
  }
  
  if (!session.user.isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  return session.user;
}

// GET /api/admin/backup - List all backups
export async function GET() {
  try {
    await checkAdminAuth();

    const backups = await prisma.backup.findMany({
      include: {
        settings: true,
        logs: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 10
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/backup - Create new backup
export async function POST(req: Request) {
  try {
    const user = await checkAdminAuth();

    const body = await req.json();
    const { type, settings } = body;

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        name: `Backup_${new Date().toISOString()}`,
        type,
        status: 'PENDING',
        userId: user.id,
        settings: {
          create: {
            compression: settings.compression || 'MEDIUM',
            encryption: settings.encryption ?? true,
            excludedPaths: settings.excludedPaths || [],
            maxConcurrent: settings.maxConcurrent || 3
          }
        }
      }
    });

    // Start backup process
    await startBackup(backup.id);

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/backup - Delete backup
export async function DELETE(req: Request) {
  try {
    await checkAdminAuth();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Delete backup and related records
    await prisma.$transaction([
      prisma.backupLog.deleteMany({
        where: { backupId: id }
      }),
      prisma.backupFile.deleteMany({
        where: { backupId: id }
      }),
      prisma.backupSettings.delete({
        where: { backupId: id }
      }),
      prisma.backup.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
} 