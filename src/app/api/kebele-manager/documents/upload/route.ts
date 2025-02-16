import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const kebeleId = formData.get('kebeleId') as string;
    const files = formData.getAll('files') as File[];

    if (!kebeleId) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedDocuments = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = join(process.cwd(), 'public', 'uploads', fileName);

      // Save file to disk
      await writeFile(filePath, buffer);

      // Create document record in database
      const document = await prisma.document.create({
        data: {
          title: file.name,
          type: 'OTHER', // You can add logic to determine type based on file extension
          path: `/uploads/${fileName}`,
          size: file.size,
          mimeType: file.type,
          kebeleId,
          uploadedBy: kebeleId, // Using kebeleId as uploadedBy for now
          status: 'PENDING'
        }
      });

      uploadedDocuments.push(document);
    }

    return NextResponse.json(uploadedDocuments);
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
} 