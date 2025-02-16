import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSMS } from './twilio.service';
import { sendEmail } from './email.service';

const prisma = new PrismaClient();

export class AuthService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static async generateToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  }

  public static async register(userData: {
    email: string;
    phone: string;
    password: string;
    fullName: string;
    username?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    // Generate OTP for both email and phone
    const emailOTP = this.generateOTP();
    const phoneOTP = this.generateOTP();

    // Create OTP verification records
    await Promise.all([
      prisma.oTPVerification.create({
        data: {
          userId: user.id,
          otp: emailOTP,
          type: 'EMAIL',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      }),
      prisma.oTPVerification.create({
        data: {
          userId: user.id,
          otp: phoneOTP,
          type: 'PHONE',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      }),
    ]);

    // Send OTP via email and SMS
    await Promise.all([
      sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        text: `Your verification code is: ${emailOTP}`,
      }),
      sendSMS({
        to: user.phone!,
        body: `Your verification code is: ${phoneOTP}`,
      }),
    ]);

    const token = await this.generateToken(user.id);
    return { user, token };
  }

  public static async login(identifier: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = await this.generateToken(user.id);
    return { user, token };
  }

  public static async verifyOTP(userId: string, otp: string, type: 'EMAIL' | 'PHONE') {
    const verification = await prisma.oTPVerification.findFirst({
      where: {
        userId,
        otp,
        type,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new Error('Invalid or expired OTP');
    }

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(type === 'EMAIL' ? { emailVerified: true } : { phoneVerified: true }),
      },
    });

    return true;
  }

  public static async initiatePasswordReset(identifier: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send reset instructions
    if (identifier === user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `Click here to reset your password: ${process.env.VITE_API_URL}/reset-password?token=${token}`,
      });
    } else if (identifier === user.phone) {
      await sendSMS({
        to: user.phone!,
        body: `Your password reset code is: ${token}`,
      });
    }

    return true;
  }

  public static async resetPassword(token: string, newPassword: string) {
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark reset token as used
    await Promise.all([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return true;
  }
} 