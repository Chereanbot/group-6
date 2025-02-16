import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const emailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    console.log('Sending email to:', validatedData.to);

    // Configure email transport with your Gmail credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "alulagirma91@gmail.com",
        pass: "wdtbewpeasycbgz",
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('SMTP connection verified');

    // Send email with better formatting
    const info = await transporter.sendMail({
      from: '"Legal System" <alulagirma91@gmail.com>',
      to: validatedData.to,
      subject: validatedData.subject,
      text: validatedData.content,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">${validatedData.subject}</h2>
          <div style="margin-top: 20px; line-height: 1.6;">
            ${validatedData.content.replace(/\n/g, '<br>')}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
            <p>This is an automated message from the Legal System.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', info.messageId);

    // Log to database or monitoring system
    await prisma.messageLog.create({
      data: {
        type: 'EMAIL',
        recipientEmail: validatedData.to,
        subject: validatedData.subject,
        status: 'SENT',
        messageId: info.messageId,
        userId: session.user.id
      }
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        messageId: info.messageId
      }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to send email:', error);

    // Log the error
    await prisma.messageLog.create({
      data: {
        type: 'EMAIL',
        recipientEmail: validatedData?.to,
        subject: validatedData?.subject,
        status: 'FAILED',
        error: error.message,
        userId: session?.user?.id
      }
    });

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

    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check SMTP credentials.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Failed to connect to email server. Please check SMTP settings.';
    }

    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : errorMessage
      }),
      { status: 500 }
    );
  }
} 