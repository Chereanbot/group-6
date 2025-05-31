import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, params) {
  const { id } = await params;
  // Find all CaseDocument records for this case, include the uploader
  const caseDocuments = await prisma.caseDocument.findMany({
    where: { caseId: id },
    orderBy: { uploadedAt: 'desc' },
    include: {
      uploader: { select: { id: true, fullName: true, email: true } }
    }
  });
  // Flatten the response for frontend
  const documents = caseDocuments.map(cd => ({
    id: cd.id,
    name: cd.title,
    url: cd.path,
    uploadedAt: cd.uploadedAt,
    uploadedBy: cd.uploader,
    size: cd.size,
    mimeType: cd.mimeType,
    type: cd.type,
    status: undefined // Add if you have a status field
  }));
  return NextResponse.json({ success: true, data: documents });
}

export async function POST(req, params) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });

  // Mock file storage: just use file name and a dummy URL
  const title = file.name;
  const path = `/uploads/${title}`;
  const size = file.size || 0;
  const mimeType = file.type || '';
  const type = 'OTHER'; // You can extract this from formData if needed

  // Get userId from auth (reuse your auth logic)
  const headersList = await headers();
  const token = headersList.get('authorization')?.split(' ')[1] ||
    req.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || !authResult.user || !authResult.user.id) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
  const userId = authResult.user.id;

  const caseDocument = await prisma.caseDocument.create({
    data: {
      caseId: id,
      title,
      type,
      path,
      size,
      mimeType,
      uploadedBy: userId,
      uploadedAt: new Date(),
    },
    include: {
      uploader: { select: { id: true, fullName: true, email: true } }
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: caseDocument.id,
      name: caseDocument.title,
      url: caseDocument.path,
      uploadedAt: caseDocument.uploadedAt,
      uploadedBy: caseDocument.uploader,
      size: caseDocument.size,
      mimeType: caseDocument.mimeType,
      type: caseDocument.type,
      status: undefined
    }
  });
}

export async function DELETE(req, params) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get('docId');
  if (!docId) return NextResponse.json({ success: false, error: 'No document id provided' }, { status: 400 });

  await prisma.caseDocument.delete({ where: { id: docId } });
  return NextResponse.json({ success: true });
} 