import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    
    let userId = session?.user?.id;

    // If no session, try JWT token
    if (!userId) {
      const token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        const authResult = await verifyAuth(token);
        if (authResult.isAuthenticated && authResult.user) {
          userId = authResult.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get coordinator's office
    const coordinator = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        coordinatorProfile: {
          include: {
            office: true
          }
        }
      }
    });

    if (!coordinator?.coordinatorProfile?.office) {
      return NextResponse.json({ error: 'Coordinator office not found' }, { status: 404 });
    }

    const officeId = coordinator.coordinatorProfile.office.id;

    // Get all admins and super admins (regardless of office)
    const admins = await prisma.user.findMany({
      where: {
        userRole: {
          in: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]
        },
        status: UserStatus.ACTIVE
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true
      }
    });

    // Get lawyers from coordinator's office
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: UserStatus.ACTIVE,
        lawyerProfile: {
          officeId
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true,
        lawyerProfile: {
          include: {
            specializations: {
              include: {
                specialization: true
              }
            },
            office: true
          }
        }
      }
    });

    // Get clients from coordinator's office
    const clients = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.CLIENT,
        status: UserStatus.ACTIVE,
        clientProfile: {
          officeId
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true,
        clientProfile: {
          select: {
            caseType: true,
            caseCategory: true,
            officeId: true
          }
        }
      }
    });

    // Transform the data to match the expected format
    const transformedLawyers = lawyers.map(lawyer => ({
      id: lawyer.id,
      fullName: lawyer.fullName,
      email: lawyer.email,
      userRole: lawyer.userRole,
      isOnline: lawyer.isOnline,
      lastSeen: lawyer.lastSeen,
      status: lawyer.status,
      lawyerProfile: lawyer.lawyerProfile ? {
        specializations: lawyer.lawyerProfile.specializations.map(spec => ({
          specialization: {
            name: spec.specialization.name
          }
        }))
      } : null
    }));

    const transformedClients = clients.map(client => ({
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      userRole: client.userRole,
      isOnline: client.isOnline,
      lastSeen: client.lastSeen,
      status: client.status,
      clientProfile: client.clientProfile ? {
        caseType: client.clientProfile.caseType,
        caseCategory: client.clientProfile.caseCategory
      } : null
    }));

    return NextResponse.json({
      admins,
      lawyers: transformedLawyers,
      clients: transformedClients
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 