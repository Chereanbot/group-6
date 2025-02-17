import { jwtVerify } from 'jose';
import { UserRoleEnum } from '@prisma/client';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  coordinatorId?: string;
  officeId?: string;
  iat?: number;
  exp?: number;
}

export async function verifyAuth(token: string): Promise<{ 
  isAuthenticated: boolean; 
  payload?: JWTPayload 
}> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Validate required fields
    if (!payload.id || !payload.email || !payload.role) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      payload: {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
        isAdmin: payload.isAdmin as boolean,
        coordinatorId: payload.coordinatorId as string | undefined,
        officeId: payload.officeId as string | undefined,
        iat: payload.iat,
        exp: payload.exp
      }
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      isAuthenticated: false
    };
  }
} 