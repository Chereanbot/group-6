import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const billingSchema = z.object({
  paymentMethod: z.object({
    type: z.enum(['CREDIT_CARD', 'BANK_ACCOUNT']),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    isDefault: z.boolean(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingPreferences: z.object({
    autoPayEnabled: z.boolean(),
    paymentDueReminder: z.boolean(),
    minimumBalance: z.number(),
    invoiceDelivery: z.enum(['EMAIL', 'MAIL', 'BOTH']),
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

    const billingProfile = await prisma.billingProfile.findUnique({
      where: { userId },
      include: {
        paymentMethods: true,
        billingAddress: true,
      },
    });

    if (!billingProfile) {
      return NextResponse.json(
        { error: 'Billing profile not found' },
        { status: 404 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      billingProfile,
      invoices,
    });
  } catch (error) {
    console.error("[BILLING_SETTINGS_GET]", error);
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
    const validatedData = billingSchema.parse(body);

    // Update billing profile in a transaction
    const updatedProfile = await prisma.$transaction(async (prisma) => {
      // Update or create billing profile
      const billingProfile = await prisma.billingProfile.upsert({
        where: { userId },
        create: {
          userId,
          autoPayEnabled: validatedData.billingPreferences.autoPayEnabled,
          paymentDueReminder: validatedData.billingPreferences.paymentDueReminder,
          minimumBalance: validatedData.billingPreferences.minimumBalance,
          invoiceDelivery: validatedData.billingPreferences.invoiceDelivery,
        },
        update: {
          autoPayEnabled: validatedData.billingPreferences.autoPayEnabled,
          paymentDueReminder: validatedData.billingPreferences.paymentDueReminder,
          minimumBalance: validatedData.billingPreferences.minimumBalance,
          invoiceDelivery: validatedData.billingPreferences.invoiceDelivery,
        },
      });

      // Update or create billing address
      await prisma.billingAddress.upsert({
        where: { billingProfileId: billingProfile.id },
        create: {
          billingProfileId: billingProfile.id,
          ...validatedData.billingAddress,
        },
        update: validatedData.billingAddress,
      });

      // Update payment method
      if (validatedData.paymentMethod.isDefault) {
        // Reset all payment methods to non-default
        await prisma.paymentMethod.updateMany({
          where: { billingProfileId: billingProfile.id },
          data: { isDefault: false },
        });
      }

      await prisma.paymentMethod.create({
        data: {
          billingProfileId: billingProfile.id,
          type: validatedData.paymentMethod.type,
          cardNumber: validatedData.paymentMethod.cardNumber,
          expiryDate: validatedData.paymentMethod.expiryDate,
          accountNumber: validatedData.paymentMethod.accountNumber,
          routingNumber: validatedData.paymentMethod.routingNumber,
          isDefault: validatedData.paymentMethod.isDefault,
        },
      });

      return billingProfile;
    });

    return NextResponse.json({
      message: "Billing settings updated successfully",
      billingProfile: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[BILLING_SETTINGS_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 