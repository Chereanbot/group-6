import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';
import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum([
    'IDENTIFICATION',
    'RESIDENCE_PROOF',
    'BIRTH_CERTIFICATE',
    'MARRIAGE_CERTIFICATE',
    'DEATH_CERTIFICATE',
    'PROPERTY_DEED',
    'TAX_DOCUMENT',
    'BUSINESS_LICENSE',
    'PERMIT',
    'CONTRACT',
    'LEGAL_NOTICE',
    'COMPLAINT',
    'APPLICATION',
    'OTHER'
  ]),
  file: z.any()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      file
    };

    const validatedData = documentSchema.parse(data);

    // Upload file to S3
    const s3Result = await uploadToS3(file, `documents/${session.user.id}/${file.name}`);

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        status: 'PENDING',
        path: s3Result.url,
        size: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
        kebeleId: session.user.kebeleId // Assuming user has kebeleId in session
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_UPLOAD',
        details: {
          documentId: document.id,
          documentType: validatedData.type
        }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Document upload error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: {
        uploadedBy: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.uploadedBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete file from S3
    await deleteFromS3(document.path);

    // Delete document record
    await prisma.document.delete({
      where: { id: documentId }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_DELETE',
        details: {
          documentId,
          documentType: document.type
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 