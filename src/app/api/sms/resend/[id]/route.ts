import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get the original SMS message
    const originalMessage = await prisma.smsMessage.findUnique({
      where: {
        id: params.id
      }
    });

    if (!originalMessage) {
      return NextResponse.json(
        { success: false, error: 'SMS message not found' },
        { status: 404 }
      );
    }

    // Create a new SMS message with the same content
    const newMessage = await prisma.smsMessage.create({
      data: {
        recipientId: originalMessage.recipientId,
        recipientName: originalMessage.recipientName,
        recipientPhone: originalMessage.recipientPhone,
        content: originalMessage.content,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      message: {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString(),
        updatedAt: newMessage.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error resending SMS:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 