import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.error('No auth token found');
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);
    
    console.log('Auth check result:', { isAuthenticated, userRole: user?.userRole });

    if (!isAuthenticated || user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      console.error('User not authenticated or not super admin:', { isAuthenticated, userRole: user?.userRole });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const search = searchParams.get('search');
    const officeId = searchParams.get('office');
    const specialization = searchParams.get('specialization');

    console.log('Query params:', { statusParam, search, officeId, specialization });

    try {
      const lawyers = await prisma.user.findMany({
        where: {
          userRole: UserRoleEnum.LAWYER,
          ...(statusParam && statusParam !== 'all' ? { status: statusParam as UserStatus } : {}),
          ...(search ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } : {}),
          lawyerProfile: {
            ...(officeId && officeId !== 'all' ? { officeId } : {}),
            ...(specialization && specialization !== 'all' ? {
              specializations: {
                some: {
                  specialization: {
                    name: specialization
                  }
                }
              }
            } : {}),
            ...(searchParams.get('experience') ? {
              experience: {
                gte: parseInt(searchParams.get('experience') || '0')
              }
            } : {}),
            ...(searchParams.get('caseLoad') ? {
              caseLoad: {
                lte: parseInt(searchParams.get('caseLoad') || '999999')
              }
            } : {})
          }
        },
        include: {
          lawyerProfile: {
            include: {
              office: true,
              specializations: {
                include: {
                  specialization: true
                }
              }
            }
          },
          assignedCases: true
        }
      });

      const transformedLawyers = lawyers.map(lawyer => ({
        id: lawyer.id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        phone: lawyer.phone,
        status: lawyer.status,
        userRole: lawyer.userRole,
        lawyerProfile: lawyer.lawyerProfile || {
          experience: 0,
          rating: 0,
          caseLoad: 0,
          office: null,
          specializations: []
        },
        assignedCases: lawyer.assignedCases || []
      }));

      return NextResponse.json({
        success: true,
        data: transformedLawyers
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database error occurred',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Top level error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data.fullName || !data.email || !data.password || !data.phone || !data.officeId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          userRole: UserRoleEnum.LAWYER,
          status: UserStatus.ACTIVE,
          emailVerified: false,
          phoneVerified: false
        }
      });

      const lawyer = await tx.lawyerProfile.create({
        data: {
          userId: newUser.id,
          experience: data.yearsOfExperience || 0,
          officeId: data.officeId,
          availability: true,
          caseLoad: 0,
          specializations: {
            create: (data.specializations || []).map((spec: string) => ({
              specialization: {
                connectOrCreate: {
                  where: { name: spec },
                  create: {
                    name: spec,
                    category: 'GENERAL',
                    description: `Specialization in ${spec}`
                  }
                }
              },
              yearsExperience: data.yearsOfExperience || 0,
              isMainFocus: true
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
              userRole: true
            }
          },
          office: true,
          specializations: {
            include: {
              specialization: true
            }
          }
        }
      });

      return lawyer;
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating lawyer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create lawyer',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 