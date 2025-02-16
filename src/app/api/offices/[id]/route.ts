import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET - Get office details by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id } = params;

    const office = await prisma.office.findUnique({
      where: { id },
      include: {
        lawyers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userRole: true,
                status: true
              }
            },
            specializations: {
              include: {
                specialization: true
              }
            }
          }
        },
        coordinators: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userRole: true,
                status: true
              }
            }
          }
        },
        // Include any other relevant relations
        serviceRequests: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS']
            }
          },
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: office
    });

  } catch (error) {
    console.error('Error fetching office details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch office details',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an office
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins can delete offices
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if office exists
    const office = await prisma.office.findUnique({
      where: { id },
      include: {
        lawyers: true,
        coordinators: true,
        serviceRequests: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS']
            }
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    // Check if office has active lawyers or coordinators
    if (office.lawyers.length > 0 || office.coordinators.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete office with active staff members' },
        { status: 400 }
      );
    }

    // Check if office has pending or in-progress service requests
    if (office.serviceRequests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete office with active service requests' },
        { status: 400 }
      );
    }

    // Delete office
    await prisma.office.delete({
      where: { id }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'DELETE_OFFICE',
        details: {
          officeId: id,
          officeName: office.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Office deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting office:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete office',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 