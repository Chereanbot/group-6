'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRoleEnum } from '@prisma/client'
import { revalidatePath } from 'next/cache'

async function verifyAdminPermissions() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'No session found', status: 401 }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userRole: true, status: true }
    })

    if (!user || user.status !== 'ACTIVE' || 
        (user.userRole !== UserRoleEnum.ADMIN && user.userRole !== UserRoleEnum.SUPER_ADMIN)) {
      return { error: 'Unauthorized: Admin or Super Admin access required', status: 403 }
    }

    return { user }
  } catch (error) {
    console.error('Admin permission verification error:', error)
    return { error: 'Failed to verify permissions', status: 500 }
  }
}

export async function getSettings() {
  try {
    const authResult = await verifyAdminPermissions()
    if (authResult.error) {
      return { error: authResult.error, status: authResult.status }
    }
    
    const settings = await prisma.settings.findMany({
      include: {
        category: true
      }
    });
    
    return { settings };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return { error: 'Failed to fetch settings', status: 500 };
  }
}

export async function updateSetting(id: string, data: any) {
  try {
    const authResult = await verifyAdminPermissions()
    if (authResult.error) {
      return { error: authResult.error, status: authResult.status }
    }

    const updated = await prisma.settings.update({
      where: { id },
      data
    });
    
    revalidatePath('/admin/settings')
    return { setting: updated };
  } catch (error) {
    console.error('Failed to update setting:', error);
    return { error: 'Failed to update setting', status: 500 };
  }
}

export async function updateBatchSettings(updates: { id: string; data: any }[]) {
  try {
    const authResult = await verifyAdminPermissions()
    if (authResult.error) {
      return { error: authResult.error, status: authResult.status }
    }

    const results = await prisma.$transaction(
      updates.map(({ id, data }) =>
        prisma.settings.update({
          where: { id },
          data
        })
      )
    );
    
    revalidatePath('/admin/settings')
    return { settings: results };
  } catch (error) {
    console.error('Failed to update settings in batch:', error);
    return { error: 'Failed to update settings in batch', status: 500 };
  }
} 