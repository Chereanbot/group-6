import { prisma } from './prisma';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, readdir, stat, rm } from 'fs/promises';
import { join, resolve } from 'path';
import { createGzip } from 'zlib';
import { createCipheriv, randomBytes } from 'crypto';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Backup, BackupSettings, BackupLog, Prisma } from '@prisma/client';

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || randomBytes(32);
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017';

// Helper type for backup with settings
type BackupWithSettings = Backup & {
  settings: BackupSettings | null;
};

// Start a backup process
export async function startBackup(backupId: string) {
  try {
    // Update backup status
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });

    // Get backup details
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
      include: {
        settings: true
      }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Create backup directory
    const backupPath = join(BACKUP_DIR, backupId);
    await mkdir(backupPath, { recursive: true });

    // Initialize backup log
    await prisma.backupLog.create({
      data: {
        backupId,
        level: 'INFO',
        message: 'Starting backup process'
      }
    });

    // Start backup process based on type
    switch (backup.type) {
      case 'FULL':
        await performFullBackup(backup);
        break;
      case 'INCREMENTAL':
        await performIncrementalBackup(backup);
        break;
      case 'DIFFERENTIAL':
        await performDifferentialBackup(backup);
        break;
      default:
        throw new Error('Unsupported backup type');
    }

    // Update backup status on completion
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Backup failed:', error);
    
    // Log error
    await prisma.backupLog.create({
      data: {
        backupId,
        level: 'ERROR',
        message: 'Backup failed: ' + (error as Error).message
      }
    });

    // Update backup status
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status: 'FAILED',
        completedAt: new Date()
      }
    });
  }
}

// Perform full backup
async function performFullBackup(backup: BackupWithSettings) {
  const backupPath = join(BACKUP_DIR, backup.id);
  const output = createWriteStream(join(backupPath, 'backup.zip'));
  const archive = archiver('zip', { zlib: { level: getCompressionLevel(backup.settings?.compression || 'MEDIUM') } });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add database backup
  await backupDatabase(archive, backup);

  // Add file system backup
  await backupFileSystem(archive, backup);

  // Finalize the archive
  await archive.finalize();

  if (backup.settings?.encryption) {
    await encryptBackup(backupPath);
  }
}

// Perform incremental backup
async function performIncrementalBackup(backup: BackupWithSettings) {
  const backupPath = join(BACKUP_DIR, backup.id);
  const output = createWriteStream(join(backupPath, 'backup.zip'));
  const archive = archiver('zip', { zlib: { level: getCompressionLevel(backup.settings?.compression || 'MEDIUM') } });

  try {
    const tempDir = join(BACKUP_DIR, backup.id, 'temp_db');
    await mkdir(tempDir, { recursive: true });

    // Get last successful backup
    const lastBackup = await prisma.backup.findFirst({
      where: {
        status: 'COMPLETED',
        type: { in: ['FULL', 'INCREMENTAL'] }
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!lastBackup) {
      // If no previous backup exists, perform full backup
      return performFullBackup(backup);
    }

    // Log backup start
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Starting incremental backup'
      }
    });

    // Extract database name from connection string
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'database';

    // Get timestamp of last backup for incremental
    const lastBackupDate = lastBackup.completedAt.toISOString();

    // Construct mongodump command with query filter for changes since last backup
    const mongodumpCmd = `mongodump --uri="${MONGODB_URI}" --out="${tempDir}" --gzip --query='{"updatedAt":{"$gt":{"$date":"${lastBackupDate}"}}}' --queryFile=null`;

    // Execute mongodump
    const { stdout, stderr } = await execAsync(mongodumpCmd);

    if (stderr && !stderr.includes('done dumping')) {
      throw new Error(`MongoDB incremental backup failed: ${stderr}`);
    }

    // Add the dump to the archive
    archive.directory(tempDir, 'database_backup');

    // Log success
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Incremental backup completed successfully',
        metadata: {
          stdout,
          databaseName: dbName,
          lastBackupId: lastBackup.id,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });

    // Pipe archive data to the file
    archive.pipe(output);

    // Finalize the archive
    await archive.finalize();

    if (backup.settings?.encryption) {
      await encryptBackup(backupPath);
    }

  } catch (error) {
    // Log error
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'ERROR',
        message: `Incremental backup failed: ${(error as Error).message}`,
        metadata: {
          error: (error as Error).toString(),
          timestamp: new Date().toISOString()
        }
      }
    });

    throw error;
  }
}

// Perform differential backup
async function performDifferentialBackup(backup: BackupWithSettings) {
  try {
    const tempDir = join(BACKUP_DIR, backup.id, 'temp_db');
    await mkdir(tempDir, { recursive: true });

    // Get last full backup
    const lastFullBackup = await prisma.backup.findFirst({
      where: {
        status: 'COMPLETED',
        type: 'FULL'
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!lastFullBackup) {
      // If no full backup exists, perform full backup
      return performFullBackup(backup);
    }

    // Log backup start
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Starting differential backup'
      }
    });

    // Extract database name from connection string
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'database';

    // Get timestamp of last full backup for differential
    const lastFullBackupDate = lastFullBackup.completedAt.toISOString();

    // Construct mongodump command with query filter for all changes since last full backup
    const mongodumpCmd = `mongodump --uri="${MONGODB_URI}" --out="${tempDir}" --gzip --query='{"updatedAt":{"$gt":{"$date":"${lastFullBackupDate}"}}}' --queryFile=null`;

    // Execute mongodump
    const { stdout, stderr } = await execAsync(mongodumpCmd);

    if (stderr && !stderr.includes('done dumping')) {
      throw new Error(`MongoDB differential backup failed: ${stderr}`);
    }

    // Add the dump to the archive
    archive.directory(tempDir, 'database_backup');

    // Log success
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Differential backup completed successfully',
        metadata: {
          stdout,
          databaseName: dbName,
          lastFullBackupId: lastFullBackup.id,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });

  } catch (error) {
    // Log error
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'ERROR',
        message: `Differential backup failed: ${(error as Error).message}`,
        metadata: {
          error: (error as Error).toString(),
          timestamp: new Date().toISOString()
        }
      }
    });

    throw error;
  }
}

// Backup database
async function backupDatabase(archive: any, backup: any) {
  try {
    const tempDir = join(BACKUP_DIR, backup.id, 'temp_db');
    await mkdir(tempDir, { recursive: true });

    // Log backup start
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Starting database backup'
      }
    });

    // Extract database name from connection string
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'database';

    // Construct mongodump command
    const mongodumpCmd = `mongodump --uri="${MONGODB_URI}" --out="${tempDir}" --gzip`;

    // Execute mongodump
    const { stdout, stderr } = await execAsync(mongodumpCmd);

    if (stderr && !stderr.includes('done dumping')) {
      throw new Error(`MongoDB backup failed: ${stderr}`);
    }

    // Add the dump to the archive
    archive.directory(tempDir, 'database_backup');

    // Log success
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'INFO',
        message: 'Database backup completed successfully',
        metadata: {
          stdout,
          databaseName: dbName,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });

  } catch (error) {
    // Log error
    await prisma.backupLog.create({
      data: {
        backupId: backup.id,
        level: 'ERROR',
        message: `Database backup failed: ${(error as Error).message}`,
        metadata: {
          error: (error as Error).toString(),
          timestamp: new Date().toISOString()
        }
      }
    });

    throw error;
  }
}

// Backup file system
async function backupFileSystem(archive: any, backup: any) {
  const excludedPaths = new Set(backup.settings.excludedPaths);

  async function addDirectory(dirPath: string) {
    const files = await readdir(dirPath);

    for (const file of files) {
      const fullPath = join(dirPath, file);
      
      if (excludedPaths.has(fullPath)) {
        continue;
      }

      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await addDirectory(fullPath);
      } else {
        archive.file(fullPath, { name: fullPath });
      }
    }
  }

  await addDirectory('./'); // Start from root directory
}

// Encrypt backup
async function encryptBackup(backupPath: string) {
  const inputFile = join(backupPath, 'backup.zip');
  const outputFile = join(backupPath, 'backup.enc');

  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

  const input = createReadStream(inputFile);
  const output = createWriteStream(outputFile);

  // Write IV at the beginning of the file
  output.write(iv);

  // Pipe the input through cipher to output
  input.pipe(cipher).pipe(output);
}

// Update backup schedule
export async function updateBackupSchedule(scheduleId: string) {
  const schedule = await prisma.backupSchedule.findUnique({
    where: { id: scheduleId }
  });

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const now = new Date();
  let nextRun = new Date();

  // Calculate next run based on frequency
  switch (schedule.frequency) {
    case 'HOURLY':
      nextRun.setHours(nextRun.getHours() + 1);
      break;
    case 'DAILY':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'WEEKLY':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'MONTHLY':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
  }

  // Set the time of day
  const [hours, minutes] = schedule.timeOfDay.split(':');
  nextRun.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  // If next run is in the past, add appropriate interval
  if (nextRun < now) {
    switch (schedule.frequency) {
      case 'HOURLY':
        nextRun.setHours(nextRun.getHours() + 1);
        break;
      case 'DAILY':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'WEEKLY':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'MONTHLY':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }

  // Update schedule
  await prisma.backupSchedule.update({
    where: { id: scheduleId },
    data: { nextRun }
  });
}

// Helper function to get compression level
function getCompressionLevel(compression: string): number {
  switch (compression) {
    case 'HIGH':
      return 9;
    case 'MEDIUM':
      return 6;
    case 'LOW':
      return 3;
    default:
      return 0;
  }
} 