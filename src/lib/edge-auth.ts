import { authConfig } from '@/config/auth.config';

export async function verifyAuthToken(token: string) {
  try {
    const response = await fetch(`${authConfig.baseUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store'
    });

    if (!response.ok) {
      return { isAuthenticated: false, user: null };
    }

    const data = await response.json();

    if (!data.isAuthenticated || !data.user) {
      return { isAuthenticated: false, user: null };
    }

    return {
      isAuthenticated: true,
      user: data.user
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { isAuthenticated: false, user: null };
  }
} 