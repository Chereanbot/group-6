import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { UserRoleEnum, UserStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    if (!request.body) {
      console.error('No request body provided');
      return new NextResponse(
        JSON.stringify({ success: false, error: 'No request body provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    console.log('Received registration request:', { ...body, password: '[REDACTED]' });

    const { 
      email, 
      password, 
      fullName, 
      role, 
      phone,
      specializations = [],
      experience = 0,
      company = '',
      address = '' 
    } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      console.error('Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName, role: !!role });
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate role
    if (!Object.values(UserRoleEnum).includes(role)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Invalid role' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user with transaction to handle related profiles
    const user = await prisma.$transaction(async (prisma) => {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Create base user
      const user = await prisma.user.create({
        data: {
          email,
          phone: phone || undefined,
          password: hashedPassword,
          fullName,
          userRole: role as UserRoleEnum,
          status: 'ACTIVE' as UserStatus,
          isAdmin: role === UserRoleEnum.SUPER_ADMIN || role === UserRoleEnum.ADMIN
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          userRole: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          isAdmin: true,
          phone: true
        }
      });

      // Create role-specific profile
      if (role === UserRoleEnum.LAWYER) {
        // Create a basic lawyer profile
        await prisma.lawyerProfile.create({
          data: {
            userId: user.id,
            specializations: [],  // Will be updated in the lawyer setup page
            experience: 0,
            rating: 0,
            caseLoad: 0,
            availability: false,
            status: 'PENDING',
            officeId: await getDefaultOfficeId(prisma)
          }
        });
      } else if (role === UserRoleEnum.COORDINATOR) {
        // Create a basic coordinator profile
        await prisma.coordinator.create({
          data: {
            userId: user.id,
            type: 'PENDING',  // This will be updated in the coordinator setup page
            status: 'PENDING',
            availability: false
          }
        });
      }

      return user;
    });

    console.log('User created successfully:', { userId: user.id, email: user.email });

    const response = {
      success: true,
      data: {
        user,
        message: role === UserRoleEnum.COORDINATOR 
          ? 'Basic coordinator account created. Please complete the profile setup.'
          : role === UserRoleEnum.LAWYER
          ? 'Basic lawyer account created. Please complete the profile setup.'
          : 'User registered successfully'
      }
    };

    return new NextResponse(
      JSON.stringify(response),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002' || error.message === 'Email already exists') {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Email already exists'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getDefaultOfficeId(prisma: any) {
  // Get or create default office
  let defaultOffice = await prisma.office.findFirst({
    where: { name: 'Main Office' }
  });

  if (!defaultOffice) {
    defaultOffice = await prisma.office.create({
      data: {
        name: 'Main Office',
        location: 'Default Location',
        capacity: 50
      }
    });
  }

  return defaultOffice.id;
} 