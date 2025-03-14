import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: {
        userId,
        userType: 'CLIENT',
      },
    });

    return NextResponse.json(settings || {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      reminderBefore: 24,
      reminderFrequency: 'daily',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, setting, value } = body;

    if (!userId || !setting) {
      return NextResponse.json(
        { error: 'User ID and setting are required' },
        { status: 400 }
      );
    }

    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId,
        userType: 'CLIENT',
      },
      update: {
        [setting]: value,
      },
      create: {
        userId,
        userType: 'CLIENT',
        [setting]: value,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        reminderBefore: 24,
        reminderFrequency: 'daily',
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
} 