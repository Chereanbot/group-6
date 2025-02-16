import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get token from authorization header
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null
      });
    }

    // Find active session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || !session.active || session.expiresAt < new Date()) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null
      });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        userRole: session.user.userRole,
        fullName: session.user.fullName,
        isAdmin: session.user.userRole === 'ADMIN' || session.user.userRole === 'SUPER_ADMIN'
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 401 }
    );
  }
}