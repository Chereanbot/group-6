import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    // Get and verify auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid authorization header',
        data: []
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload?.sub) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        data: []
      }, { status: 401 });
    }

    // Get messages for authenticated user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: payload.sub },
          { recipientId: payload.sub }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: messages,
      message: `Found ${messages.length} messages`
    });

  } catch (error) {
    console.error('Messages API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      data: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      recipientId, 
      recipientEmail,
      recipientPhone,
      recipientProfileId,
      subject, 
      content,
      priority,
      category 
    } = body;

    // Find recipient based on provided identifiers
    let recipient;

    if (recipientId) {
      recipient = await prisma.user.findUnique({
        where: { id: recipientId }
      });
    } else if (recipientEmail) {
      recipient = await prisma.user.findUnique({
        where: { email: recipientEmail }
      });
    } else if (recipientPhone) {
      recipient = await prisma.user.findUnique({
        where: { phone: recipientPhone }
      });
    } else if (recipientProfileId) {
      recipient = await prisma.user.findFirst({
        where: {
          OR: [
            { lawyerProfile: { id: recipientProfileId } },
            { coordinatorProfile: { id: recipientProfileId } }
            
          ]
        }
      });
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        subject: subject || 'New Message',
        content,
        sender: {
          connect: { id: session.user.id }
        },
        recipient: {
          connect: { id: recipient.id }
        },
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        isRead: false,
        isStarred: false,
        isArchived: false
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            lawyerProfile: true,
            coordinatorProfile: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            lawyerProfile: true,
            coordinatorProfile: true
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 