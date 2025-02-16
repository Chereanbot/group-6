import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  return handleVerify(request);
}

export async function POST(request: Request) {
  return handleVerify(request);
}

async function handleVerify(request: Request) {
  try {
    // Get token from Authorization header or request body
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    let token = authHeader?.split(' ')[1];

    // If no token in header, try to get from cookie
    if (!token) {
      const cookieHeader = await headersList.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies['auth-token'];
      }

      // If it's a POST request, also try to get from body
      if (!token && request.method === 'POST') {
        try {
          const body = await request.json();
          token = body.token;
        } catch (e) {
          console.error('Failed to parse request body:', e);
        }
      }
    }

    if (!token) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    // Find active session
    const session = await prisma.session.findFirst({
      where: {
        token,
        active: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userRole: true,
            fullName: true,
            status: true,
            isAdmin: true
          }
        }
      }
    });

    if (!session?.user) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        userRole: session.user.userRole,
        fullName: session.user.fullName,
        status: session.user.status,
        isAdmin: session.user.userRole === UserRoleEnum.ADMIN || session.user.userRole === UserRoleEnum.SUPER_ADMIN
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ isAuthenticated: false, user: null });
  }
}