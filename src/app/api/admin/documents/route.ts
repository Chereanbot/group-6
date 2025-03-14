import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, DocumentStatus } from '@prisma/client';

interface DocumentStats {
  status: DocumentStatus;
  _count: {
    _all: number;
  }
}

// Helper function to verify admin authorization
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

export async function GET(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Build where clause based on filters
    const where: any = {};

    // Status filter
    const status = searchParams.getAll('status');
    if (status.length > 0) {
      where.status = { in: status };
    }

    // Type filter
    const types = searchParams.getAll('type');
    if (types.length > 0) {
      where.type = { in: types };
    }

    // Category filter
    const categories = searchParams.getAll('category');
    if (categories.length > 0) {
      where.category = { in: categories };
    }

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { uploadedBy: { 
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    // Get documents with related data
    const documents = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        kebele: {
          select: {
            id: true,
            kebeleName: true,
            kebeleNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get stats for each status
    const pendingCount = await prisma.document.count({
      where: { ...where, status: 'PENDING' }
    });
    const approvedCount = await prisma.document.count({
      where: { ...where, status: 'APPROVED' }
    });
    const rejectedCount = await prisma.document.count({
      where: { ...where, status: 'REJECTED' }
    });

    const total = pendingCount + approvedCount + rejectedCount;

    // Format the response to match our frontend interface
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      uploadedBy: {
        id: doc.user.id,
        fullName: doc.user.fullName,
        email: doc.user.email
      },
      fileUrl: doc.path,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      notes: doc.description,
      category: doc.type,
      size: doc.size,
      mimeType: doc.mimeType,
      kebele: doc.kebele ? {
        id: doc.kebele.id,
        name: doc.kebele.kebeleName,
        number: doc.kebele.kebeleNumber
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        documents: formattedDocuments,
        stats: {
          total,
          pending: pendingCount,
          verified: approvedCount,
          rejected: rejectedCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 