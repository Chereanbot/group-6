import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // First get all client profiles in the coordinator's office
    const clientProfiles = await prisma.clientProfile.findMany({
      where: {
        officeId: coordinator.officeId
      },
      include: {
        user: true
      }
    });

    // Get all documents for these users
    const documents = await prisma.document.findMany({
      where: {
        uploadedBy: {
          in: clientProfiles.map(profile => profile.userId)
        }
      }
    });

    // Create a map of user details for quick lookup
    const userMap = new Map(
      clientProfiles.map(profile => [
        profile.userId,
        {
          fullName: profile.user.fullName,
          clientProfile: {
            region: profile.region,
            zone: profile.zone,
            wereda: profile.wereda,
            kebele: profile.kebele
          }
        }
      ])
    );

    // Transform the data to match the expected format
    const transformedDocuments = documents.map(doc => {
      const userDetails = userMap.get(doc.uploadedBy);
      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        status: doc.status,
        path: doc.path,
        size: doc.size,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        kebeleId: doc.kebeleId,
        client: userDetails
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedDocuments
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id, status, notes } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      );
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        status,
        ...(notes && { description: notes })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDocument
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update document' },
      { status: 500 }
    );
  }
} 