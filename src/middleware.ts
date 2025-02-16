import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/edge-auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for public paths and coordinator paths
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api/auth') ||
    path.startsWith('/coordinator') ||
    path.startsWith('/api/coordinator') ||
    path === '/login' ||
    path === '/register' ||
    path === '/unauthorized' ||
    path.startsWith('/public') ||
    path.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      if (!path.startsWith('/api/')) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user data
    const authResult = await verifyAuthToken(token);

    if (!authResult.isAuthenticated || !authResult.user) {
      if (!path.startsWith('/api/')) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check lawyer-specific routes
    if (path.startsWith('/lawyer/') && authResult.user.userRole !== 'LAWYER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (path.startsWith('/admin/') && authResult.user.userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', authResult.user.id);
    requestHeaders.set('x-user-role', authResult.user.userRole);
    if (authResult.user.lawyerProfile) {
      requestHeaders.set('x-lawyer-id', authResult.user.id);
      requestHeaders.set('x-lawyer-profile-id', authResult.user.lawyerProfile.id);
      requestHeaders.set('x-lawyer-office-id', authResult.user.lawyerProfile.office.id);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/lawyer/:path*',
    '/client/:path*',
    '/api/:path*',
    '/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)',
  ]
}; 