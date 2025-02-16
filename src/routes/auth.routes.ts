import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';
import { authValidation } from '../validations/auth.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(authValidation.register),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(authValidation.login),
  AuthController.login
);

router.post(
  '/verify-otp',
  validateRequest(authValidation.verifyOTP),
  AuthController.verifyOTP
);

router.post(
  '/forgot-password',
  validateRequest(authValidation.forgotPassword),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(authValidation.resetPassword),
  AuthController.resetPassword
);

export default router; 