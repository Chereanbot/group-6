import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
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

    const body = await request.json();
    const { fullName, email, phone, status, clientProfile } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update client information
    const updatedClient = await prisma.user.update({
      where: {
        id: params.id
      },
      data: {
        fullName,
        email,
        phone,
        status,
        clientProfile: {
          update: {
            age: clientProfile.age,
            sex: clientProfile.sex,
            region: clientProfile.region,
            zone: clientProfile.zone,
            wereda: clientProfile.wereda,
            kebele: clientProfile.kebele,
            caseType: clientProfile.caseType,
            caseCategory: clientProfile.caseCategory
          }
        }
      },
      include: {
        clientProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update client' },
      { status: 500 }
    );
  }
} 