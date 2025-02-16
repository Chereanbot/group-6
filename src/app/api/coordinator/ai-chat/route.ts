import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId } = await request.json();

    // Get or create chat session
    let chat = chatId ? await prisma.agentChat.findUnique({
      where: { id: chatId }
    }) : await prisma.agentChat.create({
      data: {
        userId: session.user.id,
        messages: [],
        context: {
          role: "coordinator",
          systemPrompt: "You are an AI assistant helping a legal coordinator manage cases and tasks."
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Convert stored messages to chat history format
    const history = (chat.messages as any[]).map((msg: any) => ({
      role: msg.role,
      parts: msg.content,
    }));

    // Start a chat session with history
    const aiChat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Generate a response
    const result = await aiChat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Update chat with new messages
    const updatedChat = await prisma.agentChat.update({
      where: { id: chat.id },
      data: {
        messages: {
          push: [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: text, timestamp: new Date() }
          ]
        }
      }
    });

    return NextResponse.json({ 
      response: text,
      chatId: updatedChat.id
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  }
}
