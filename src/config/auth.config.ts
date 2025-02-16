export const authConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-key',
  sessionExpiry: process.env.SESSION_EXPIRY || '2400h',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL
}; 