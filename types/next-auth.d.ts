import { UserRoleEnum } from '@prisma/client'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRoleEnum
      status: string
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    userRole: UserRoleEnum
    fullName: string
    status: string
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRoleEnum
    isAdmin: boolean
  }
} 