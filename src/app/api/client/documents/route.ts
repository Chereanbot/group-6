import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, DocumentType, DocumentStatus } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    // --- client-rule-for-401 ---
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { isAuthenticated, user } = await verifyAuth(token);
    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    // --- end rule ---

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const type = formData.get('type') as DocumentType;
    const description = formData.get('description') as string | null;
    if (!file || !title || !type) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Simulate file storage (replace with S3 or other provider as needed)
    // For now, just use a placeholder path
    const filePath = `/uploads/${Date.now()}-${file.name}`;
    // You can implement file saving logic here

    // Create Document record
    const document = await prisma.document.create({
      data: {
        title,
        description,
        type,
        status: DocumentStatus.PENDING,
        path: filePath,
        size: file.size,
        mimeType: file.type,
        uploadedBy: user.id,
        kebeleId: '', // Set kebeleId if needed
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'DOCUMENT_UPLOAD',
        details: {
          documentId: document.id,
          documentType: type
        }
      }
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload document' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // --- client-rule-for-401 ---
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { isAuthenticated, user } = await verifyAuth(token);
    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    // --- end rule ---

    const documents = await prisma.document.findMany({
      where: {
        uploadedBy: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        },
        serviceDocuments: {
          select: {
            serviceRequest: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    const docs = documents.map(doc => {
      const serviceDoc = doc.serviceDocuments?.[0];
      const serviceRequest = serviceDoc?.serviceRequest;
      return {
        ...doc,
        user: doc.user ?? null,
        serviceRequest: serviceRequest ? {
          title: serviceRequest.title
        } : null
      };
    });

    return NextResponse.json(docs);
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