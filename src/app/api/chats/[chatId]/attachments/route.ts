import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { MessageStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
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
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId,
        chatId
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

    // TODO: Implement file upload to your storage service (e.g., S3, Azure Blob Storage)
    // For now, we'll simulate it with a fake URL
    const fileUrl = `https://storage.example.com/${chatId}/${file.name}`;

    // Create message with attachment
    const message = await prisma.message.create({
      data: {
        text: `Sent a file: ${file.name}`,
        senderId: userId,
        chatId,
        status: MessageStatus.SENT,
        attachments: {
          create: {
            fileUrl,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        }
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
        attachments: true
      }
    });

    // Update unread count for other participants
    await prisma.userChat.updateMany({
      where: {
        chatId,
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
        id: chatId
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