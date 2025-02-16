import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityEvents } from '@/lib/services/securityEvents';

export async function securityMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check if IP is blocked
  const isBlocked = await securityEvents.isIPBlocked(ip);
  if (isBlocked) {
    return new NextResponse(
      JSON.stringify({ error: 'Access denied' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Rate limiting logic could be added here
  
  return NextResponse.next();
} 