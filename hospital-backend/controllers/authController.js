import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import generateToken from '../utils/generateToken.js';
import generateCryptoToken from '../utils/generateCryptoToken.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
} from '../utils/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: create role profile ──────────────────────────
const createRoleProfile = async (user, body) => {
  if (user.role === 'patient') {
    await Patient.create({ user: user._id });
  } else if (user.role === 'doctor') {
    await Doctor.create({
      user: user._id,
      specialization: body.specialization || 'General',
      qualification: body.qualification || 'MBBS',
      consultationFee: body.consultationFee || 500,
    });
  }
  // nurse, receptionist, admin — Staff model is handled by admin separately
};

// ── 1. REGISTER ──────────────────────────────────────────
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, qualification, consultationFee } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate email verification token
    const { rawToken, hashedToken } = generateCryptoToken();
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name, email, password,
      role: role || 'patient',
      phone,
      emailVerificationToken: hashedToken,
      emailVerificationExpire: expire,
      isEmailVerified: false,
    });

    await createRoleProfile(user, req.body);

    // Send verification email
    await sendVerificationEmail(user, rawToken);

    res.status(201).json({
      success: true,
      message: `Registration successful! Please check ${email} to verify your account.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 2. VERIFY EMAIL ──────────────────────────────────────
// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '🎉 Email verified successfully! You are now logged in.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 3. RESEND VERIFICATION EMAIL ─────────────────────────
// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const { rawToken, hashedToken } = generateCryptoToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user, rawToken);

    res.json({ success: true, message: 'Verification email resent! Check your inbox.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 4. LOGIN ─────────────────────────────────────────────
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first. Check your inbox or resend verification.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 5. GOOGLE OAUTH ──────────────────────────────────────
// POST /api/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken, role } = req.body;
    let payload;

    if (accessToken) {
      // Custom button implicit flow provides access_token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user info from Google');
      payload = await response.json();
      payload.email_verified = true; // userinfo api means verified
    } else if (idToken) {
      // Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      return res.status(400).json({ success: false, message: 'No Google token provided' });
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user — register via Google
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        role: role || 'patient',
        authProvider: 'google',
        isEmailVerified: true, // Google emails are pre-verified
        isActive: true,
      });
      await createRoleProfile(user, {});
      await sendWelcomeEmail(user);
    } else {
      // Existing user — link Google account if not linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + error.message });
  }
};

// ── 6. FORGOT PASSWORD ───────────────────────────────────
// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Always return same message (security — don't reveal if email exists)
    const genericMsg = 'If an account exists with this email, a password reset link has been sent.';

    if (!user) {
      return res.json({ success: true, message: genericMsg });
    }
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.',
      });
    }

    const { rawToken, hashedToken } = generateCryptoToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, rawToken);

    res.json({ success: true, message: genericMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 7. RESET PASSWORD ────────────────────────────────────
// PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request again.' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    await sendPasswordChangedEmail(user);

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful! You are now logged in.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 8. GET MY PROFILE ────────────────────────────────────
// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'doctor') profile = await Doctor.findOne({ user: user._id });
    else if (user.role === 'patient') profile = await Patient.findOne({ user: user._id });
    res.json({ success: true, user, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 9. UPDATE PASSWORD (logged in) ───────────────────────
// PUT /api/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.authProvider === 'google') {
      return res.status(400).json({ success: false, message: 'Google accounts cannot use password change.' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await sendPasswordChangedEmail(user);

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
