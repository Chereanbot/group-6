import { UserRoleEnum, UserStatus } from '@prisma/client'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      userRole: UserRoleEnum
      fullName: string
      status: UserStatus
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    userRole: UserRoleEnum
    fullName: string
    status: UserStatus
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    userRole: UserRoleEnum
    fullName: string
    status: UserStatus
    isAdmin: boolean
  }
} 