import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, content, subject } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email
    await sendEmail({
      to: email,
      subject: subject || 'New Message',
      html: content
    });

    // Store message in database
    const dbMessage = await prisma.message.create({
      data: {
        subject: subject || 'Email Message',
        content,
        senderId: session.user.id,
        recipientEmail: email,
        messageType: 'EMAIL',
        status: 'SENT',
        priority: 'MEDIUM',
        category: 'EMAIL'
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: dbMessage
    });

  } catch (error) {
    console.error('Email Send Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
} 