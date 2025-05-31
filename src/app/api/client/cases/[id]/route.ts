import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET(
  req: Request,
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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch case details
    const case_ = await prisma.case.findUnique({
      where: { 
        id: params.id,
        clientId: user.id // Ensure the case belongs to the authenticated client
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          }
        },
        assignedOffice: {
          select: {
            id: true,
            name: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            path: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' }
        },
        activities: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            caseId: true,
            userId: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        caseEvents: {
          select: {
            id: true,
            title: true,
            description: true,
            start: true,
            end: true,
            status: true,
          },
          orderBy: { start: 'desc' }
        }
      }
    });

    if (!case_) {
      return NextResponse.json(
        { success: false, message: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: case_
    });
  } catch (error) {
    console.error('Error fetching case details:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 