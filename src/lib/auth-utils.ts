import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface AuthHeaders {
  userId: string | null;
  userRole: string | null;
  ipAddress: string;
  userAgent: string;
}

export async function getAuthHeaders(): Promise<AuthHeaders> {
  const headersList = await headers();
  return {
    userId: headersList.get('x-user-id') ?? null,
    userRole: headersList.get('x-user-role') ?? null,
    ipAddress: headersList.get('x-forwarded-for') ?? 'unknown',
    userAgent: headersList.get('user-agent') ?? 'unknown',
  };
}

export function checkLawyerAuth(headers: AuthHeaders, feature: string) {
  if (!headers.userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Please login first' },
      { status: 401 }
    );
  }

  if (headers.userRole !== 'LAWYER') {
    return NextResponse.json(
      { error: `Unauthorized: Only lawyers can access ${feature}` },
      { status: 403 }
    );
  }

  return null;
} 