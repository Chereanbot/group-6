import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user information
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        username: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch client profile
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: {
        age: true,
        sex: true,
        numberOfFamily: true,
        healthStatus: true,
        region: true,
        zone: true,
        wereda: true,
        kebele: true,
        houseNumber: true,
        caseType: true,
        caseCategory: true,
        officeId: true,
        guidelines: true,
        notes: true,
      },
    });

    // Fetch cases
    const cases = await prisma.case.findMany({
      where: { clientId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch documents
    const documents = await prisma.document.findMany({
      where: { uploadedBy: user.id },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: { clientId: user.id },
      select: {
        id: true,
        purpose: true,
        scheduledTime: true,
        status: true,
      },
      orderBy: { scheduledTime: 'desc' },
    });

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { recipientId: user.id },
      select: {
        id: true,
        text: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Return all client information
    return NextResponse.json({
      user: userData,
      profile,
      cases,
      documents,
      appointments,
      messages,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching client information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 