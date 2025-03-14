import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const documentSchema = z.object({
  storage: z.object({
    defaultLocation: z.enum(['LOCAL', 'CLOUD', 'HYBRID']),
    autoBackup: z.boolean(),
    backupFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    retentionPeriod: z.number(), // in days
  }),
  templates: z.array(z.object({
    name: z.string(),
    category: z.enum(['CONTRACT', 'LETTER', 'PLEADING', 'MOTION', 'OTHER']),
    content: z.string(),
    isDefault: z.boolean(),
    tags: z.array(z.string()),
  })),
  naming: z.object({
    convention: z.string(),
    autoIncrement: z.boolean(),
    dateFormat: z.string(),
    includeCategory: z.boolean(),
    includeClient: z.boolean(),
  }),
  versioning: z.object({
    enabled: z.boolean(),
    maxVersions: z.number().min(1).max(100),
    autoSaveInterval: z.number(), // in minutes
    keepDrafts: z.boolean(),
  }),
  sharing: z.object({
    defaultPermission: z.enum(['VIEW', 'EDIT', 'NONE']),
    requireApproval: z.boolean(),
    watermark: z.boolean(),
    expiryDays: z.number().optional(),
  }),
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

    const documentSettings = await prisma.documentSettings.findUnique({
      where: { userId },
      include: {
        templates: true,
      },
    });

    if (!documentSettings) {
      // Return default document settings
      return NextResponse.json({
        storage: {
          defaultLocation: 'CLOUD',
          autoBackup: true,
          backupFrequency: 'DAILY',
          retentionPeriod: 365,
        },
        templates: [],
        naming: {
          convention: '[CATEGORY]-[DATE]-[CLIENT]-[COUNTER]',
          autoIncrement: true,
          dateFormat: 'YYYY-MM-DD',
          includeCategory: true,
          includeClient: true,
        },
        versioning: {
          enabled: true,
          maxVersions: 10,
          autoSaveInterval: 5,
          keepDrafts: true,
        },
        sharing: {
          defaultPermission: 'VIEW',
          requireApproval: true,
          watermark: true,
          expiryDays: 30,
        },
      });
    }

    return NextResponse.json(documentSettings);
  } catch (error) {
    console.error("[DOCUMENT_SETTINGS_GET]", error);
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
    const validatedData = documentSchema.parse(body);

    // Update document settings in a transaction
    const updatedSettings = await prisma.$transaction(async (prisma) => {
      // Update or create document settings
      const documentSettings = await prisma.documentSettings.upsert({
        where: { userId },
        create: {
          userId,
          defaultLocation: validatedData.storage.defaultLocation,
          autoBackup: validatedData.storage.autoBackup,
          backupFrequency: validatedData.storage.backupFrequency,
          retentionPeriod: validatedData.storage.retentionPeriod,
          namingConvention: validatedData.naming.convention,
          autoIncrement: validatedData.naming.autoIncrement,
          dateFormat: validatedData.naming.dateFormat,
          includeCategory: validatedData.naming.includeCategory,
          includeClient: validatedData.naming.includeClient,
          versioningEnabled: validatedData.versioning.enabled,
          maxVersions: validatedData.versioning.maxVersions,
          autoSaveInterval: validatedData.versioning.autoSaveInterval,
          keepDrafts: validatedData.versioning.keepDrafts,
          defaultPermission: validatedData.sharing.defaultPermission,
          requireApproval: validatedData.sharing.requireApproval,
          watermark: validatedData.sharing.watermark,
          expiryDays: validatedData.sharing.expiryDays,
        },
        update: {
          defaultLocation: validatedData.storage.defaultLocation,
          autoBackup: validatedData.storage.autoBackup,
          backupFrequency: validatedData.storage.backupFrequency,
          retentionPeriod: validatedData.storage.retentionPeriod,
          namingConvention: validatedData.naming.convention,
          autoIncrement: validatedData.naming.autoIncrement,
          dateFormat: validatedData.naming.dateFormat,
          includeCategory: validatedData.naming.includeCategory,
          includeClient: validatedData.naming.includeClient,
          versioningEnabled: validatedData.versioning.enabled,
          maxVersions: validatedData.versioning.maxVersions,
          autoSaveInterval: validatedData.versioning.autoSaveInterval,
          keepDrafts: validatedData.versioning.keepDrafts,
          defaultPermission: validatedData.sharing.defaultPermission,
          requireApproval: validatedData.sharing.requireApproval,
          watermark: validatedData.sharing.watermark,
          expiryDays: validatedData.sharing.expiryDays,
        },
      });

      // Update templates
      await prisma.documentTemplate.deleteMany({
        where: { documentSettingsId: documentSettings.id },
      });

      await Promise.all(validatedData.templates.map(template =>
        prisma.documentTemplate.create({
          data: {
            documentSettingsId: documentSettings.id,
            name: template.name,
            category: template.category,
            content: template.content,
            isDefault: template.isDefault,
            tags: template.tags,
          },
        })
      ));

      return documentSettings;
    });

    return NextResponse.json({
      message: "Document settings updated successfully",
      documentSettings: updatedSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[DOCUMENT_SETTINGS_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 