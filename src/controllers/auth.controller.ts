import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { email, phone, password, fullName, username } = req.body;

      const result = await AuthService.register({
        email,
        phone,
        password,
        fullName,
        username,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email and phone.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;

      const result = await AuthService.login(identifier, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  public static async verifyOTP(req: Request, res: Response) {
    try {
      const { userId, otp, type } = req.body;

      await AuthService.verifyOTP(userId, otp, type);

      res.status(200).json({
        success: true,
        message: `${type.toLowerCase()} verified successfully`,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Verification failed',
      });
    }
  }

  public static async forgotPassword(req: Request, res: Response) {
    try {
      const { identifier } = req.body;

      await AuthService.initiatePasswordReset(identifier);

      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to initiate password reset',
      });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Password reset failed',
      });
    }
  }
} 