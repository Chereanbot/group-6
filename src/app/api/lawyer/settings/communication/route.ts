import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const communicationSchema = z.object({
  email: z.object({
    signature: z.string(),
    replyTo: z.string().email().optional(),
    ccAddresses: z.array(z.string().email()),
    bccAddresses: z.array(z.string().email()),
    defaultTemplate: z.string(),
    followUpReminders: z.boolean(),
    followUpDays: z.number().min(1),
  }),
  messaging: z.object({
    availabilityStatus: z.enum(['ONLINE', 'AWAY', 'BUSY', 'OFFLINE']),
    autoReply: z.boolean(),
    autoReplyMessage: z.string(),
    deliveryReceipts: z.boolean(),
    readReceipts: z.boolean(),
  }),
  clientCommunication: z.object({
    preferredMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'PORTAL']),
    responseTimeLimit: z.number(), // in hours
    autoResponseEnabled: z.boolean(),
    autoResponseMessage: z.string(),
    followUpSchedule: z.array(z.object({
      days: z.number(),
      message: z.string(),
    })),
  }),
  autoResponders: z.array(z.object({
    name: z.string(),
    trigger: z.enum(['OUT_OF_OFFICE', 'AFTER_HOURS', 'VACATION', 'CUSTOM']),
    message: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    active: z.boolean(),
  })),
  templates: z.array(z.object({
    name: z.string(),
    subject: z.string(),
    content: z.string(),
    category: z.enum(['GENERAL', 'FOLLOW_UP', 'MEETING', 'BILLING', 'LEGAL']),
    variables: z.array(z.string()),
    isDefault: z.boolean(),
  })),
});

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const communicationSettings = await prisma.communicationSettings.findUnique({
      where: { userId },
      include: {
        autoResponders: true,
        templates: true,
      },
    });

    if (!communicationSettings) {
      // Return default communication settings
      return NextResponse.json({
        email: {
          signature: '',
          ccAddresses: [],
          bccAddresses: [],
          defaultTemplate: '',
          followUpReminders: true,
          followUpDays: 3,
        },
        messaging: {
          availabilityStatus: 'ONLINE',
          autoReply: false,
          autoReplyMessage: '',
          deliveryReceipts: true,
          readReceipts: true,
        },
        clientCommunication: {
          preferredMethod: 'EMAIL',
          responseTimeLimit: 24,
          autoResponseEnabled: true,
          autoResponseMessage: 'Thank you for your message. I will respond within 24 hours.',
          followUpSchedule: [
            { days: 3, message: 'First follow-up' },
            { days: 7, message: 'Second follow-up' },
          ],
        },
        autoResponders: [],
        templates: [],
      });
    }

    return NextResponse.json(communicationSettings);
  } catch (error) {
    console.error("[COMMUNICATION_SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = communicationSchema.parse(body);

    // Update communication settings in a transaction
    const updatedSettings = await prisma.$transaction(async (prisma) => {
      // Update or create communication settings
      const communicationSettings = await prisma.communicationSettings.upsert({
        where: { userId },
        create: {
          userId,
          signature: validatedData.email.signature,
          replyTo: validatedData.email.replyTo,
          ccAddresses: validatedData.email.ccAddresses,
          bccAddresses: validatedData.email.bccAddresses,
          defaultTemplate: validatedData.email.defaultTemplate,
          followUpReminders: validatedData.email.followUpReminders,
          followUpDays: validatedData.email.followUpDays,
          availabilityStatus: validatedData.messaging.availabilityStatus,
          autoReply: validatedData.messaging.autoReply,
          autoReplyMessage: validatedData.messaging.autoReplyMessage,
          deliveryReceipts: validatedData.messaging.deliveryReceipts,
          readReceipts: validatedData.messaging.readReceipts,
          preferredMethod: validatedData.clientCommunication.preferredMethod,
          responseTimeLimit: validatedData.clientCommunication.responseTimeLimit,
          autoResponseEnabled: validatedData.clientCommunication.autoResponseEnabled,
          autoResponseMessage: validatedData.clientCommunication.autoResponseMessage,
          followUpSchedule: validatedData.clientCommunication.followUpSchedule,
        },
        update: {
          signature: validatedData.email.signature,
          replyTo: validatedData.email.replyTo,
          ccAddresses: validatedData.email.ccAddresses,
          bccAddresses: validatedData.email.bccAddresses,
          defaultTemplate: validatedData.email.defaultTemplate,
          followUpReminders: validatedData.email.followUpReminders,
          followUpDays: validatedData.email.followUpDays,
          availabilityStatus: validatedData.messaging.availabilityStatus,
          autoReply: validatedData.messaging.autoReply,
          autoReplyMessage: validatedData.messaging.autoReplyMessage,
          deliveryReceipts: validatedData.messaging.deliveryReceipts,
          readReceipts: validatedData.messaging.readReceipts,
          preferredMethod: validatedData.clientCommunication.preferredMethod,
          responseTimeLimit: validatedData.clientCommunication.responseTimeLimit,
          autoResponseEnabled: validatedData.clientCommunication.autoResponseEnabled,
          autoResponseMessage: validatedData.clientCommunication.autoResponseMessage,
          followUpSchedule: validatedData.clientCommunication.followUpSchedule,
        },
      });

      // Update auto responders
      await prisma.autoResponder.deleteMany({
        where: { communicationSettingsId: communicationSettings.id },
      });

      await Promise.all(validatedData.autoResponders.map(responder =>
        prisma.autoResponder.create({
          data: {
            communicationSettingsId: communicationSettings.id,
            name: responder.name,
            trigger: responder.trigger,
            message: responder.message,
            startDate: responder.startDate ? new Date(responder.startDate) : null,
            endDate: responder.endDate ? new Date(responder.endDate) : null,
            active: responder.active,
          },
        })
      ));

      // Update templates
      await prisma.communicationTemplate.deleteMany({
        where: { communicationSettingsId: communicationSettings.id },
      });

      await Promise.all(validatedData.templates.map(template =>
        prisma.communicationTemplate.create({
          data: {
            communicationSettingsId: communicationSettings.id,
            name: template.name,
            subject: template.subject,
            content: template.content,
            category: template.category,
            variables: template.variables,
            isDefault: template.isDefault,
          },
        })
      ));

      return communicationSettings;
    });

    return NextResponse.json({
      message: "Communication settings updated successfully",
      communicationSettings: updatedSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[COMMUNICATION_SETTINGS_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 