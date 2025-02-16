import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const agentController = {
  async createInstruction(req: Request) {
    try {
      const { type, description, priority, coordinatorId } = await req.json();

      const instruction = await prisma.agentInstruction.create({
        data: {
          type,
          description,
          priority,
          coordinatorId,
          isActive: true
        }
      });

      // Create initial action for the instruction
      await this.processAgentAction(new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({
          instructionId: instruction.id,
          type: 'INITIAL_ANALYSIS',
          payload: {
            instruction: description,
            type,
            priority
          }
        })
      }));

      return NextResponse.json({ success: true, data: instruction });
    } catch (error) {
      console.error('Error creating instruction:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create instruction', error },
        { status: 500 }
      );
    }
  },

  async getInstructions(req: Request) {
    try {
      const { coordinatorId } = await req.json();

      const instructions = await prisma.agentInstruction.findMany({
        where: {
          coordinatorId,
          isActive: true
        },
        include: {
          actions: {
            include: {
              notifications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ success: true, data: instructions });
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch instructions', error },
        { status: 500 }
      );
    }
  },

  async processAgentAction(req: Request) {
    try {
      const { instructionId, type, payload } = await req.json();

      const instruction = await prisma.agentInstruction.findUnique({
        where: { id: instructionId },
        include: {
          coordinator: {
            include: {
              user: true
            }
          }
        }
      });

      if (!instruction) {
        throw new Error('Instruction not found');
      }

      const action = await prisma.agentAction.create({
        data: {
          type,
          status: 'PENDING',
          payload,
          instructionId,
          startedAt: new Date()
        }
      });

      // Process the action using Gemini AI
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `
        You are a legal coordinator's AI assistant. Analyze this task and provide actionable insights.
        
        Instruction Type: ${type}
        Instruction: ${instruction.description}
        Priority: ${instruction.priority}
        Additional Context: ${JSON.stringify(payload)}
        
        Please provide:
        1. A detailed analysis of the task
        2. Specific actions that should be taken
        3. Any potential risks or concerns
        4. Priority level for notifications (LOW, MEDIUM, HIGH)
        
        Format your response as JSON with this structure:
        {
          "analysis": "string",
          "actions": ["string"],
          "risks": ["string"],
          "notifications": [
            {
              "title": "string",
              "message": "string",
              "priority": "LOW|MEDIUM|HIGH",
              "type": "INFO|WARNING|ALERT|SUCCESS"
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisResult = JSON.parse(response.text());

      // Create notifications
      const notifications = await Promise.all(
        analysisResult.notifications.map((notification: any) =>
          prisma.agentNotification.create({
            data: {
              title: notification.title,
              message: notification.message,
              type: notification.type,
              priority: notification.priority,
              actionId: action.id,
              userId: instruction.coordinator?.user?.id || '',
              status: 'UNREAD'
            }
          })
        )
      );

      // Update action with results
      const updatedAction = await prisma.agentAction.update({
        where: { id: action.id },
        data: {
          status: 'COMPLETED',
          result: analysisResult,
          completedAt: new Date()
        },
        include: {
          notifications: true
        }
      });

      return NextResponse.json({ success: true, data: updatedAction });
    } catch (error) {
      console.error('Error processing agent action:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to process agent action', error },
        { status: 500 }
      );
    }
  },

  async getNotifications(req: Request) {
    try {
      const { userId, status } = await req.json();

      const notifications = await prisma.agentNotification.findMany({
        where: {
          userId,
          ...(status && { status })
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          action: {
            include: {
              instruction: true
            }
          }
        }
      });

      return NextResponse.json({ success: true, data: notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch notifications', error },
        { status: 500 }
      );
    }
  },

  async markNotificationAsRead(req: Request) {
    try {
      const { notificationId } = await req.json();

      const notification = await prisma.agentNotification.update({
        where: { id: notificationId },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });

      return NextResponse.json({ success: true, data: notification });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to mark notification as read', error },
        { status: 500 }
      );
    }
  },

  async getUnreadCount(req: Request) {
    try {
      const { userId } = await req.json();

      const count = await prisma.agentNotification.count({
        where: {
          userId,
          status: 'UNREAD'
        }
      });

      return NextResponse.json({ success: true, data: { count } });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to get unread count', error },
        { status: 500 }
      );
    }
  }
};
