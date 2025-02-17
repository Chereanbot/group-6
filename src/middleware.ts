import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/edge-auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for public paths
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api/auth') ||
    path === '/login' ||
    path === '/register' ||
    path === '/unauthorized' ||
    path.startsWith('/public') ||
    path.startsWith('/assets') ||
    path === '/' ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // Get token from cookie or authorization header
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      if (!path.startsWith('/api/')) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
      }
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 200 }
      );
    }

    // Verify JWT token
    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      if (!path.startsWith('/api/')) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
      }
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // Check coordinator-specific routes
    if (path.startsWith('/coordinator') || path.startsWith('/api/coordinator')) {
      if (payload.role !== 'COORDINATOR') {
        if (!path.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        return NextResponse.json(
          { success: false, message: 'Unauthorized - Not a coordinator' },
          { status: 200 }
        );
      }
    }

    // Check admin-specific routes
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (!payload.isAdmin) {
        if (!path.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        return NextResponse.json(
          { success: false, message: 'Unauthorized - Not an admin' },
          { status: 200 }
        );
      }
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);
    if (payload.coordinatorId) {
      requestHeaders.set('x-coordinator-id', payload.coordinatorId);
    }
    if (payload.officeId) {
      requestHeaders.set('x-office-id', payload.officeId);
    }

    return NextResponse.next({
      headers: requestHeaders,
    });

  } catch (error) {
    console.error('Token verification error:', error);
    // Token verification failed
    if (!path.startsWith('/api/')) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(url);
    }
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 200 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - assets (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
  ],
}; 