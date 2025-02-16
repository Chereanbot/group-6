import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserStatus, UserRoleEnum } from '@prisma/client';
import { loginSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        userRole: true,
        status: true,
        isAdmin: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
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
      isAdmin: user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN
    };

    return NextResponse.json({
      success: true,
      user: userData,
      token: session.token
    }, {
      headers: {
        'Set-Cookie': `auth-token=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}