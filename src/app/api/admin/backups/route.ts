import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { BackupStatus, BackupType, UserRoleEnum, Prisma } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import crypto from 'crypto';

export async function GET() {
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

    const backups = await prisma.backup.findMany({
      include: {
        settings: true,
        logs: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if backup files exist and add file status
    const backupsWithFileStatus = await Promise.all(
      backups.map(async (backup) => {
        let fileExists = false;
        let fullPath = '';
        
        if (backup.path) {
          try {
            fullPath = path.join(process.cwd(), backup.path);
            await fs.access(fullPath);
            fileExists = true;
          } catch (error) {
            console.error(`Backup file not found at: ${fullPath}`);
          }
        }

        const stats = fileExists ? await fs.stat(fullPath) : null;
        
        return {
          ...backup,
          fileExists,
          downloadUrl: fileExists ? `/api/admin/backups/${backup.id}/download` : null,
          size: stats?.size || backup.size || 0
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: backupsWithFileStatus,
      message: `Successfully loaded ${backupsWithFileStatus.length} backups`
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    const body = await request.json();
    const { type = BackupType.FULL, settings } = body;

    // Create backup directory if it doesn't exist
    const backupDir = 'backups';
    const fullBackupDir = path.join(process.cwd(), backupDir);
    await fs.mkdir(fullBackupDir, { recursive: true });

    // Create a consistent backup file name with timestamp and extension
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.zip`;
    const relativePath = path.join(backupDir, backupFileName);
    const fullPath = path.join(process.cwd(), relativePath);

    const backupData: Prisma.BackupCreateInput = {
      name: `Backup_${timestamp}`,
      type,
      status: BackupStatus.PENDING,
      path: relativePath,  // Store relative path in database
      createdBy: {
        connect: { id: user.id }
      }
    };

    // Only create settings if they are provided
    if (settings) {
      backupData.settings = {
        create: settings
      };
    }

    const backup = await prisma.backup.create({
      data: backupData,
      include: {
        settings: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Log the paths for debugging
    console.log('Created backup with paths:', {
      relativePath,
      fullPath,
      storedPath: backup.path
    });

    // Start the backup process
    startBackupProcess(backup.id).catch(error => {
      console.error('Error starting backup process:', error);
    });

    return NextResponse.json({ 
      success: true, 
      data: backup,
      message: 'Backup process started successfully'
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function startBackupProcess(backupId: string) {
  try {
    console.log('Starting backup process for ID:', backupId);

    // Update status to IN_PROGRESS
    await prisma.backup.update({
      where: { id: backupId },
      data: { 
        status: BackupStatus.IN_PROGRESS,
        startedAt: new Date()
      }
    });

    // Get backup details
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
      include: { settings: true }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    console.log('Found backup:', {
      id: backup.id,
      path: backup.path,
      status: backup.status
    });

    // Create backup directory if it doesn't exist
    const backupDir = 'backups';
    const fullBackupDir = path.join(process.cwd(), backupDir);
    await fs.mkdir(fullBackupDir, { recursive: true });

    // Get the full path for file operations
    const fullPath = path.join(process.cwd(), backup.path);
    console.log('Using backup paths:', {
      backupDir,
      fullBackupDir,
      storedPath: backup.path,
      fullPath
    });

    // Create a write stream for the backup file
    const writeStream = createWriteStream(fullPath);
    const gzip = createGzip();
    const hash = crypto.createHash('sha256');

    // Get all data to backup
    console.log('Fetching data for backup...');
    const [users, cases, offices] = await Promise.all([
      prisma.user.findMany({
        include: {
          lawyerProfile: true,
          coordinatorProfile: true
        }
      }),
      prisma.case.findMany({
        include: {
          assignedLawyer: true,
          assignedOffice: true,
          client: true
        }
      }),
      prisma.office.findMany({
        include: {
          lawyers: {
            include: {
              user: true
            }
          },
          coordinators: {
            include: {
              user: true
            }
          },
          cases: true
        }
      })
    ]);

    console.log('Data fetched:', {
      users: users.length,
      cases: cases.length,
      offices: offices.length
    });

    // Create backup data object
    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        cases,
        offices
      }
    };

    // Convert data to JSON string
    const jsonData = JSON.stringify(backupData, null, 2);

    // Create a temporary file for the JSON data
    const tempFile = path.join(fullBackupDir, `${backup.id}_temp.json`);
    await fs.writeFile(tempFile, jsonData, 'utf8');
    console.log('Temporary file created:', tempFile);

    // Create read stream from temp file
    const readStream = createReadStream(tempFile);

    // Pipe the data through compression and calculate hash
    readStream.pipe(hash);
    console.log('Starting compression and hash calculation...');
    await pipeline(readStream, gzip, writeStream);

    // Get file stats
    const stats = await fs.stat(fullPath);
    const checksum = hash.digest('hex');

    console.log('Backup file created:', {
      path: fullPath,
      size: stats.size,
      checksum: checksum.substring(0, 8) + '...' // Log only part of the checksum
    });

    // Clean up temp file
    await fs.unlink(tempFile);
    console.log('Temporary file cleaned up');

    // Update backup record with file details
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: BackupStatus.COMPLETED,
        completedAt: new Date(),
        size: stats.size,
        checksum
      }
    });

    // Log success
    await prisma.backupLog.create({
      data: {
        backupId,
        message: 'Backup completed successfully',
        level: 'INFO',
        metadata: {
          size: stats.size,
          checksum,
          path: backup.path
        }
      }
    });

    console.log('Backup process completed successfully');

  } catch (error) {
    console.error('Error in backup process:', error);
    
    // Update backup status to failed
    await prisma.backup.update({
      where: { id: backupId },
      data: { status: BackupStatus.FAILED }
    });

    // Log error
    await prisma.backupLog.create({
      data: {
        backupId,
        message: `Backup failed: ${error.message}`,
        level: 'ERROR',
        metadata: {
          error: error.message,
          stack: error.stack
        }
      }
    });
  }
} 