'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRoleEnum } from '@prisma/client'

async function verifyAdminPermissions() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== UserRoleEnum.ADMIN) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export async function getSettings() {
  try {
    await verifyAdminPermissions()
    
    const settings = await prisma.settings.findMany({
      include: {
        category: true
      }
    });
    
    if (!settings) {
      throw new Error('No settings found');
    }
    
    return settings;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch settings');
  }
}

export async function updateSetting(id: string, data: any) {
  try {
    await verifyAdminPermissions()

    const updated = await prisma.settings.update({
      where: { id },
      data
    });
    
    if (!updated) {
      throw new Error('Failed to update setting');
    }
    
    return updated;
  } catch (error) {
    console.error('Failed to update setting:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update setting');
  }
}

export async function updateBatchSettings(updates: { id: string; data: any }[]) {
  try {
    await verifyAdminPermissions()

    const results = await prisma.$transaction(
      updates.map(({ id, data }) =>
        prisma.settings.update({
          where: { id },
          data
        })
      )
    );
    
    if (!results || results.length !== updates.length) {
      throw new Error('Failed to update some settings');
    }
    
    return results;
  } catch (error) {
    console.error('Failed to update settings in batch:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update settings in batch');
  }
} 