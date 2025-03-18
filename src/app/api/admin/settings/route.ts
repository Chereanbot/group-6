import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = cookies();
    const user = await verifyAuth(cookieStore);

    if (!user || user.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Fetch settings from database
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        system: {
          automaticUpdates: true,
          updateInterval: 30,
          emailNotifications: true,
          workloadAlerts: true,
          maxCaseLoad: 50,
          defaultOffice: 'main',
          language: 'en',
          timezone: 'UTC',
        },
        notifications: {
          caseAssignments: true,
          caseUpdates: true,
          workloadAlerts: true,
          performanceReports: true,
          systemUpdates: true,
          emailDigest: 'daily',
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAttempts: 5,
          ipWhitelist: [],
        },
      });
    }

    // Transform database settings to frontend format
    return NextResponse.json({
      system: {
        automaticUpdates: settings.automaticUpdates,
        updateInterval: settings.updateInterval,
        emailNotifications: settings.emailNotifications,
        workloadAlerts: settings.workloadAlerts,
        maxCaseLoad: settings.maxCaseLoad,
        defaultOffice: settings.defaultOffice,
        language: settings.language,
        timezone: settings.timezone,
      },
      notifications: {
        caseAssignments: settings.notificationCaseAssignments,
        caseUpdates: settings.notificationCaseUpdates,
        workloadAlerts: settings.notificationWorkloadAlerts,
        performanceReports: settings.notificationPerformanceReports,
        systemUpdates: settings.notificationSystemUpdates,
        emailDigest: settings.emailDigestFrequency,
      },
      security: {
        twoFactorAuth: settings.twoFactorAuthRequired,
        sessionTimeout: settings.sessionTimeoutMinutes,
        passwordExpiry: settings.passwordExpiryDays,
        loginAttempts: settings.maxLoginAttempts,
        ipWhitelist: settings.ipWhitelist,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const user = await verifyAuth(cookieStore);

    if (!user || user.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { type, settings } = await request.json();

    // Validate settings based on type
    if (!type || !settings || !['system', 'notifications', 'security'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update settings in database
    const existingSettings = await prisma.systemSettings.findFirst();

    if (!existingSettings) {
      // Create new settings if none exist
      await prisma.systemSettings.create({
        data: transformSettingsForDatabase(type, settings),
      });
    } else {
      // Update existing settings
      await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: transformSettingsForDatabase(type, settings),
      });
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

function transformSettingsForDatabase(type: string, settings: any) {
  switch (type) {
    case 'system':
      return {
        automaticUpdates: settings.automaticUpdates,
        updateInterval: settings.updateInterval,
        emailNotifications: settings.emailNotifications,
        workloadAlerts: settings.workloadAlerts,
        maxCaseLoad: settings.maxCaseLoad,
        defaultOffice: settings.defaultOffice,
        language: settings.language,
        timezone: settings.timezone,
      };
    case 'notifications':
      return {
        notificationCaseAssignments: settings.caseAssignments,
        notificationCaseUpdates: settings.caseUpdates,
        notificationWorkloadAlerts: settings.workloadAlerts,
        notificationPerformanceReports: settings.performanceReports,
        notificationSystemUpdates: settings.systemUpdates,
        emailDigestFrequency: settings.emailDigest,
      };
    case 'security':
      return {
        twoFactorAuthRequired: settings.twoFactorAuth,
        sessionTimeoutMinutes: settings.sessionTimeout,
        passwordExpiryDays: settings.passwordExpiry,
        maxLoginAttempts: settings.loginAttempts,
        ipWhitelist: settings.ipWhitelist,
      };
    default:
      throw new Error('Invalid settings type');
  }
} 