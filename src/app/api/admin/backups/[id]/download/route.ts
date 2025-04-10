import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

export async function GET(
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

    const backup = await prisma.backup.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!backup) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Backup not found',
          details: `No backup found with ID: ${params.id}`
        },
        { status: 404 }
      );
    }

    if (backup.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Backup is not ready for download',
          details: `Current status: ${backup.status}`
        },
        { status: 400 }
      );
    }

    // Check if file exists and is accessible
    try {
      // Always use the full path for file operations
      const fullPath = path.join(process.cwd(), backup.path);
      const stats = await fs.stat(fullPath);
      
      if (!stats.isFile()) {
        throw new Error('Backup path does not point to a file');
      }

      // Create a read stream for the file
      const fileStream = createReadStream(fullPath);
      const readable = Readable.from(fileStream);

      // Create headers for file download
      const headers = new Headers();
      headers.set('Content-Type', 'application/zip');
      headers.set('Content-Disposition', `attachment; filename="${path.basename(backup.path)}"`);
      headers.set('Content-Length', stats.size.toString());

      // Return the file as a stream
      return new NextResponse(readable, {
        status: 200,
        headers
      });

    } catch (error) {
      console.error(`Error accessing backup file at ${backup.path}:`, error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Backup file not found or inaccessible',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to download backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 