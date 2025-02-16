import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    console.log('Verified payload:', payload); // Debug log
    
    if (!payload || !payload.userId) {
      console.error('Invalid or missing payload:', payload);
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    // Handle admin user case
    if (payload.userId === 'admin-123') {
      return NextResponse.json({
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        userRole: payload.userRole,
        isAdmin: payload.isAdmin,
        twoFactorEnabled: false
      });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        status: 'ACTIVE'
      },
      include: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      userRole: user.userRole,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 