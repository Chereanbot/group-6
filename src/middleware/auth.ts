import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, PermissionModule, PermissionAction } from '@/types/security.types';

// Define protected route patterns
const PROTECTED_ROUTES = [
  '/admin/:path*',
  '/lawyer/:path*',
  '/coordinator/:path*',
  '/cases/:path*',
  '/documents/:path*',
  '/settings/:path*',
  '/api/:path*'
];

// Define route permissions
const ROUTE_PERMISSIONS: Record<string, { roles: UserRoleEnum[], permissions?: string[] }> = {
  '/admin': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    permissions: ['SETTINGS_VIEW']
  },
  '/lawyer': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.LAWYER],
    permissions: ['CASES_VIEW']
  },
  '/coordinator': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.COORDINATOR],
    permissions: ['CASES_VIEW']
  },
  '/cases': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.LAWYER, UserRoleEnum.COORDINATOR, UserRoleEnum.CLIENT],
    permissions: ['CASES_VIEW']
  },
  '/documents': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.LAWYER, UserRoleEnum.COORDINATOR, UserRoleEnum.CLIENT],
    permissions: ['DOCUMENTS_VIEW']
  },
  '/settings': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    permissions: ['SETTINGS_VIEW']
  }
};

// API endpoint permissions
const API_PERMISSIONS: Record<string, { roles: UserRoleEnum[], permissions: string[] }> = {
  'GET': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.LAWYER, UserRoleEnum.COORDINATOR, UserRoleEnum.CLIENT],
    permissions: ['AUTH_LOGIN']
  },
  'POST': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    permissions: ['AUTH_LOGIN']
  },
  'PUT': {
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    permissions: ['AUTH_LOGIN']
  },
  'DELETE': {
    roles: [UserRoleEnum.SUPER_ADMIN],
    permissions: ['AUTH_LOGIN']
  }
};

async function validateSession(token: string | null) {
  if (!token) return null;

  try {
    const session = await prisma.session.findFirst({
      where: {
        token: token,
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
            isAdmin: true,
            status: true
          }
        }
      }
    });

    return session?.user || null;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(pattern => {
    const regexPattern = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return regexPattern.test(path);
  });
}

function getRoutePermissions(path: string) {
  const route = Object.keys(ROUTE_PERMISSIONS).find(route => path.startsWith(route));
  return route ? ROUTE_PERMISSIONS[route] : null;
}

function hasRequiredPermissions(
  user: any,
  requiredRoles: UserRoleEnum[],
  requiredPermissions?: string[]
): boolean {
  if (!user) return false;

  // Check role
  const hasRole = requiredRoles.includes(user.userRole as UserRoleEnum);
  if (!hasRole) return false;

  // Super admin always has access
  if (user.userRole === UserRoleEnum.SUPER_ADMIN) return true;

  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    return requiredPermissions.some(permission => user.permissions?.includes(permission));
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip authentication for public routes
  if (!isProtectedRoute(path)) {
    return NextResponse.next();
  }

  // Get token from header or cookie
  const token = request.headers.get('authorization')?.split(' ')[1] || 
                request.cookies.get('token')?.value;

  // Validate session and get user
  const user = await validateSession(token);

  if (!user) {
    // Redirect to login for page requests
    if (!path.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
    
    // Return 401 for API requests
    return NextResponse.json(
      { error: 'Authentication required' },
        { status: 401 }
      );
    }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    if (!path.startsWith('/api/')) {
      const suspendedUrl = new URL('/suspended', request.url);
      return NextResponse.redirect(suspendedUrl);
    }
    return NextResponse.json(
      { error: 'Account is not active' },
        { status: 403 }
      );
    }

  // Get required permissions for the route
  const routePermissions = getRoutePermissions(path);
  
  // For API routes, check method-specific permissions
  if (path.startsWith('/api/')) {
    const method = request.method;
    const apiPermissions = API_PERMISSIONS[method];
    
    if (!apiPermissions || !hasRequiredPermissions(user, apiPermissions.roles, apiPermissions.permissions)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }
  }
  // For page routes, check route-specific permissions
  else if (routePermissions && !hasRequiredPermissions(user, routePermissions.roles, routePermissions.permissions)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Add user info to headers for API routes
  if (path.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.userRole);
    requestHeaders.set('x-user-email', user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};