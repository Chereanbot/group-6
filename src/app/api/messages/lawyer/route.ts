import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MessageCategory, MessagePriority, MessageStatus, UserRoleEnum } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
  category: z.nativeEnum(MessageCategory),
  priority: z.nativeEnum(MessagePriority),
  caseId: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Verify user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawyerProfile: true }
    });

    if (!user || user.userRole !== UserRoleEnum.LAWYER) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Only lawyers can access this endpoint' }),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const isRead = searchParams.get('isRead');
    const isStarred = searchParams.get('isStarred');
    const isArchived = searchParams.get('isArchived');
    const caseId = searchParams.get('caseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      OR: [
        { recipientId: session.user.id },
        { senderId: session.user.id }
      ],
      AND: [
        {
          OR: [
            { category: MessageCategory.CASE_RELATED },
            { category: MessageCategory.ADMINISTRATIVE },
            { category: MessageCategory.LEGAL_ADVICE }
          ]
        }
      ]
    };

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (isRead) where.isRead = isRead === 'true';
    if (isStarred) where.isStarred = isStarred === 'true';
    if (isArchived) where.isArchived = isArchived === 'true';
    if (caseId) where.caseId = caseId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
            lawyerProfile: {
              select: {
                specializations: true,
                experience: true
              }
            }
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
            lawyerProfile: {
              select: {
                specializations: true,
                experience: true
              }
            }
          }
        },
        case: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            priority: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, messages }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to fetch lawyer messages:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
      }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Verify user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawyerProfile: true }
    });

    if (!user || user.userRole !== UserRoleEnum.LAWYER) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Only lawyers can send messages through this endpoint' }),
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = messageSchema.parse(body);

    // If caseId is provided, verify the lawyer is assigned to the case
    if (validatedData.caseId) {
      const case_ = await prisma.case.findFirst({
        where: {
          id: validatedData.caseId,
          lawyerId: session.user.id
        }
      });

      if (!case_) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'You are not assigned to this case' }),
          { status: 403 }
        );
      }
    }

    // Create message with transaction to ensure all related records are created
    const message = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          senderId: session.user.id,
          recipientId: validatedData.recipientId,
          subject: validatedData.subject,
          content: validatedData.content,
          category: validatedData.category,
          priority: validatedData.priority,
          status: MessageStatus.SENT,
          caseId: validatedData.caseId,
          attachments: validatedData.attachments ? {
            createMany: {
              data: validatedData.attachments
            }
          } : undefined
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userRole: true,
              lawyerProfile: {
                select: {
                  specializations: true,
                  experience: true
                }
              }
            }
          },
          recipient: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userRole: true
            }
          },
          case: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              priority: true
            }
          },
          attachments: true
        }
      });

      // Create notification for recipient
      await tx.notification.create({
        data: {
          userId: validatedData.recipientId,
          title: 'New Legal Message',
          message: `You have a new message from lawyer ${user.fullName}${validatedData.caseId ? ' regarding a case' : ''}`,
          type: 'NEW_MESSAGE',
          priority: validatedData.priority,
          link: `/admin/messages/lawyer?id=${message.id}`
        }
      });

      // If message is case-related, create case activity
      if (validatedData.caseId) {
        await tx.caseActivity.create({
          data: {
            caseId: validatedData.caseId,
            userId: session.user.id,
            title: 'Message Sent',
            description: `Lawyer ${user.fullName} sent a message regarding the case`,
            type: 'COMMUNICATION'
          }
        });
      }

      return message;
    });

    return new NextResponse(
      JSON.stringify({ success: true, message }),
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Failed to send lawyer message:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        }),
        { status: 400 }
      );
    }
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
      }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Verify user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawyerProfile: true }
    });

    if (!user || user.userRole !== UserRoleEnum.LAWYER) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Only lawyers can update messages through this endpoint' }),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, isRead, isStarred, isArchived } = body;

    if (!messageId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message ID is required' }),
        { status: 400 }
      );
    }

    // Verify the message belongs to the lawyer
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    });

    if (!existingMessage) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message not found or unauthorized' }),
        { status: 404 }
      );
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: isRead !== undefined ? isRead : undefined,
        isStarred: isStarred !== undefined ? isStarred : undefined,
        isArchived: isArchived !== undefined ? isArchived : undefined
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, message }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to update lawyer message:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Verify user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawyerProfile: true }
    });

    if (!user || user.userRole !== UserRoleEnum.LAWYER) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Only lawyers can delete messages through this endpoint' }),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message ID is required' }),
        { status: 400 }
      );
    }

    // Verify the message belongs to the lawyer
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    });

    if (!message) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message not found or unauthorized' }),
        { status: 404 }
      );
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to delete lawyer message:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
} 