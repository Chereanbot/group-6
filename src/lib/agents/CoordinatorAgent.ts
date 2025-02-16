import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext, AgentInstruction, AgentNotification, WebsiteContent } from './types';
import { PrismaClient } from '@prisma/client';

export class CoordinatorAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private context: AgentContext;
  private prisma: PrismaClient;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.context = {
      instructions: [],
      websiteContent: [],
      userPreferences: {},
      notifications: []
    };
    this.prisma = new PrismaClient();
  }

  async initialize() {
    await this.loadInstructions();
    await this.loadWebsiteContent();
    await this.loadUserPreferences();
    this.startMonitoring();
  }

  private async loadInstructions() {
    const instructions = await this.prisma.agentInstruction.findMany({
      where: { isActive: true },
      include: {
        actions: {
          include: {
            notifications: true
          }
        }
      }
    });
    this.context.instructions = instructions;
  }

  private async loadWebsiteContent() {
    const content = await this.prisma.websiteContent.findMany();
    this.context.websiteContent = content;
  }

  private async loadUserPreferences() {
    // Load from your user preferences table or settings
    this.context.userPreferences = {};
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.checkForUpdates();
    }, 300000); // Check every 5 minutes
  }

  private async checkForUpdates() {
    await this.loadInstructions();
    await this.loadWebsiteContent();
  }

  async processInstruction(instruction: AgentInstruction) {
    try {
      const prompt = `
        Analyze this instruction and provide actionable insights:
        Type: ${instruction.type}
        Description: ${instruction.description}
        Priority: ${instruction.priority}
        
        Context:
        ${JSON.stringify(this.context.websiteContent)}
        
        Provide:
        1. Analysis of the task
        2. Required actions
        3. Potential risks
        4. Notifications to create
        
        Format as JSON:
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());

      // Create action record
      const action = await this.prisma.agentAction.create({
        data: {
          type: 'ANALYSIS',
          status: 'COMPLETED',
          payload: instruction,
          result: analysis,
          instructionId: instruction.id,
          startedAt: new Date(),
          completedAt: new Date(),
          notifications: {
            create: analysis.notifications.map((n: any) => ({
              title: n.title,
              message: n.message,
              type: n.type,
              priority: n.priority,
              userId: instruction.coordinatorId,
              status: 'UNREAD'
            }))
          }
        }
      });

      return action;
    } catch (error) {
      console.error('Error processing instruction:', error);
      throw error;
    }
  }

  async createNotification(notification: Partial<AgentNotification>) {
    return await this.prisma.agentNotification.create({
      data: notification as any
    });
  }

  async getNotifications(userId: string) {
    return await this.prisma.agentNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async processInstructionOriginal(instruction: string) {
    const prompt = this.buildPrompt(instruction);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return this.parseResponse(response.text());
  }

  private buildPrompt(instruction: string): string {
    return `
      You are an AI assistant for a university loans and savings coordinator.
      
      Current Context:
      - Website Content: ${JSON.stringify(this.context.websiteContent)}
      - Active Instructions: ${JSON.stringify(this.context.instructions)}
      - User Preferences: ${JSON.stringify(this.context.userPreferences)}

      Your task is to: ${instruction}

      Please provide a response that:
      1. Is relevant to the university loans and savings context
      2. Follows all stored instructions and preferences
      3. Identifies any necessary notifications or alerts
      4. Suggests specific actions if needed

      Response Format:
      {
        "analysis": "Your analysis of the situation",
        "actions": ["List of recommended actions"],
        "notifications": ["List of necessary notifications"],
        "priority": "high|medium|low"
      }
    `;
  }

  private parseResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse agent response:', error);
      return {
        analysis: response,
        actions: [],
        notifications: [],
        priority: 'low'
      };
    }
  }

  async createNotificationOriginal(notification: Omit<AgentNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: AgentNotification = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    await this.prisma.agentNotification.create({
      data: newNotification
    });

    return newNotification;
  }

  private async checkWebsiteUpdates() {
    for (const website of this.context.websiteContent) {
      try {
        const response = await fetch(website.url);
        const newContent = await response.text();

        if (newContent !== website.content) {
          const analysis = await this.processInstructionOriginal(
            `Analyze the following website changes and identify important updates: 
             Old Content: ${website.content}
             New Content: ${newContent}`
          );

          if (analysis.notifications.length > 0) {
            for (const notification of analysis.notifications) {
              await this.createNotificationOriginal({
                title: 'Website Update',
                message: notification,
                type: 'info',
                priority: analysis.priority
              });
            }
          }

          // Update stored content
          await this.prisma.websiteContent.update({
            where: { url: website.url },
            data: { content: newContent, lastUpdated: new Date() }
          });
        }
      } catch (error) {
        console.error(`Failed to check website ${website.url}:`, error);
      }
    }
  }

  private async checkUserActivities() {
    const activities = await this.prisma.userActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const analysis = await this.processInstructionOriginal(
      `Analyze these recent user activities and identify any patterns or issues that require attention: 
       ${JSON.stringify(activities)}`
    );

    if (analysis.notifications.length > 0) {
      for (const notification of analysis.notifications) {
        await this.createNotificationOriginal({
          title: 'Activity Alert',
          message: notification,
          type: 'warning',
          priority: analysis.priority
        });
      }
    }
  }
}
