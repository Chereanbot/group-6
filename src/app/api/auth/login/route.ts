import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserStatus, UserRoleEnum } from '@prisma/client';
import { loginSchema } from '@/lib/validations/auth';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { identifier, password } = validatedData;

    // Determine if identifier is email, phone, or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[0-9]{10,15}$/.test(identifier);
    // If not email or phone, assume it's a username

    // Find user based on identifier type
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: isEmail ? identifier : undefined },
          { phone: isPhone ? identifier : undefined },
          { username: !isEmail && !isPhone ? identifier : undefined }
        ]
      },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        userRole: true,
        status: true,
        isAdmin: true,
        coordinatorProfile: {
          include: {
            office: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 200 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 200 }
      );
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, message: 'Account is not active' },
        { status: 200 }
      );
    }

   

    // Generate JWT token using jose
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    try {
      const token = await new SignJWT({
        id: user.id,
        email: user.email,
        role: user.userRole,
        isAdmin: user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN,
        coordinatorId: user.coordinatorProfile?.id,
        officeId: user.coordinatorProfile?.office?.id
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        userAgent: request.headers.get('user-agent') || undefined,
        lastIpAddress: request.headers.get('x-forwarded-for') || undefined,
        active: true
      }
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userRole: user.userRole,
      status: user.status,
      isAdmin: user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN,
      coordinatorProfile: user.userRole === UserRoleEnum.COORDINATOR ? {
        id: user.coordinatorProfile?.id,
        type: user.coordinatorProfile?.type,
        office: user.coordinatorProfile?.office
      } : undefined
    };

    // Create response with token and user data
    const response = NextResponse.json({
      success: true,
      user: userData,
      token
    });

    // Set HTTP-only cookie with token
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 200 }
    );
  }
}