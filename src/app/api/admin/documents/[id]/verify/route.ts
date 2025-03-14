import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, DocumentStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { status, notes } = await request.json();

    if (!status || !Object.values(DocumentStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        status,
        notes,
        verifiedBy: {
          connect: { id: authResult.user.id }
        },
        verifiedAt: new Date()
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    // Log the verification activity
    await prisma.activity.create({
      data: {
        action: `DOCUMENT_${status}`,
        details: {
          documentId: document.id,
          documentTitle: document.title,
          status,
          notes
        },
        userId: authResult.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 