import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { MessageStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        const authResult = await verifyAuth(token);
        if (authResult.isAuthenticated && authResult.user) {
          userId = authResult.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a participant in the chat
    const userChat = await prisma.userChat.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId: params.chatId
        }
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to Cloudinary
    const formDataForCloudinary = new FormData();
    formDataForCloudinary.append('file', file);
    formDataForCloudinary.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formDataForCloudinary
      }
    );

    if (!cloudinaryResponse.ok) {
      throw new Error('Failed to upload file to Cloudinary');
    }

    const cloudinaryData = await cloudinaryResponse.json();

    // Create message with attachment
    const message = await prisma.message.create({
      data: {
        text: `Sent a file: ${file.name}`,
        senderId: userId,
        chatId: params.chatId,
        status: MessageStatus.SENT,
        attachments: {
          create: {
            url: cloudinaryData.secure_url,
            name: file.name,
            type: file.type,
            size: file.size,
            publicId: cloudinaryData.public_id,
            resourceType: cloudinaryData.resource_type,
            format: cloudinaryData.format
          }
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
            isOnline: true,
            lastSeen: true
          }
        },
        attachments: true
      }
    });

    // Update unread count for other participants
    await prisma.userChat.updateMany({
      where: {
        chatId: params.chatId,
        userId: {
          not: userId
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });

    // Update chat's updatedAt
    await prisma.chat.update({
      where: {
        id: params.chatId
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 