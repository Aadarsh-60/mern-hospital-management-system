import express from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public

// Register a new user
router.post('/register', register);

// Verify email
router.get('/verify-email/:token', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerification);

// Login
router.post('/login', login);

// Google authentication
router.post('/google', googleAuth);

// Forgot password
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Private
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

export default router;
