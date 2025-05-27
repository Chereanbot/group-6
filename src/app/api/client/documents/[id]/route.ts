import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request, contextPromise: Promise<{ params: { id: string } }>) {
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

    const { params } = await contextPromise;
    const document = await prisma.document.findUnique({
      where: { id: params.id },
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

    if (!document || document.uploadedBy !== user.id) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }

    const serviceDoc = document.serviceDocuments?.[0];
    const serviceRequest = serviceDoc?.serviceRequest;
    const docData = {
      ...document,
      user: document.user ?? null,
      serviceRequest: serviceRequest ? { title: serviceRequest.title } : null
    };

    return NextResponse.json({ success: true, data: docData });
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch document' }, { status: 500 });
  }
} 