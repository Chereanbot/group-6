import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { DocumentType, UserRoleEnum } from '@prisma/client';

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
    
        if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
          return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
          );
        }
    
    // Get the form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(join(uploadsDir, '.gitkeep'), '');
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }

    const documentIds: string[] = [];

    // Get user's kebele from their profile
    const userProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: user.id
      },
      select: {
        kebele: true
      }
    });

    if (!userProfile?.kebele) {
      return NextResponse.json(
        { error: 'User kebele information not found' },
        { status: 400 }
      );
    }

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = join(uploadsDir, fileName);

      // Save file to disk
      await writeFile(filePath, buffer);

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          title: file.name,
          type: DocumentType.APPLICATION,
          status: 'PENDING',
          path: `/uploads/${fileName}`,
          size: file.size,
          mimeType: file.type,
          uploadedBy: user.id,
          kebeleId: userProfile.kebele
        }
      });

      documentIds.push(document.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        documentIds,
        message: 'Files uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 