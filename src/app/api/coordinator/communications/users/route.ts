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

    // Get all admins and super admins
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

    // Get lawyers in the same office
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
        status: true
      }
    });

    // Get all kebele managers from active kebeles
    const kebeleManagers = await prisma.kebeleManager.findMany({
      where: {
        status: 'ACTIVE',
        kebele: {
          status: 'ACTIVE'
        }
      },
      include: {
        kebele: {
          select: {
            id: true,
            kebeleName: true,
            subCity: true,
            district: true,
            contactPhone: true,
            contactEmail: true,
            workingHours: true
          }
        }
      }
    });

    // Transform kebele managers to match user format
    const transformedKebeleManagers = kebeleManagers.map(manager => ({
      id: manager.id,
      fullName: manager.fullName,
      email: manager.email,
      userRole: 'KEBELE_MANAGER' as UserRoleEnum,
      isOnline: false,
      lastSeen: null,
      status: UserStatus.ACTIVE,
      kebeleProfile: {
        kebeleName: manager.kebele.kebeleName,
        subCity: manager.kebele.subCity,
        district: manager.kebele.district,
        position: manager.position,
        phone: manager.phone,
        contactPhone: manager.kebele.contactPhone,
        contactEmail: manager.kebele.contactEmail,
        workingHours: manager.kebele.workingHours
      }
    }));

    return NextResponse.json({
      admins,
      lawyers,
      kebeleManagers: transformedKebeleManagers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 