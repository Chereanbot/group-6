import { authConfig } from '@/config/auth.config';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from './prisma';
import { UserRoleEnum } from '@prisma/client';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getSession } from 'next-auth/react';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: authConfig.nextAuthSecret,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            lawyerProfile: true,
            coordinatorProfile: {
              include: {
                office: true
              }
            }
          }
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          userRole: user.userRole,
          isAdmin: user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.userRole;
        token.isAdmin = user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            id: true,
            email: true,
            userRole: true,
            status: true,
            fullName: true
          }
        });

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            role: user.userRole,
            status: user.status,
            name: user.fullName,
            isAdmin: user.userRole === UserRoleEnum.ADMIN || user.userRole === UserRoleEnum.SUPER_ADMIN
          };
        }
      }
      return session;
    }
  }
};

export async function verifyAuth(token: string) {
  try {
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

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
            status: true
          }
        }
      }
    });

    if (!session?.user) {
      return { isAuthenticated: false, user: null };
    }

    return {
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        userRole: session.user.userRole,
        fullName: session.user.fullName,
        status: session.user.status,
        isAdmin: session.user.userRole === UserRoleEnum.ADMIN || session.user.userRole === UserRoleEnum.SUPER_ADMIN
      }
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false, user: null };
  }
}
