import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Base send function ───────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// ── 1. Email Verification ────────────────────────────
export const sendVerificationEmail = async (user, verificationToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Hospital Management</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">Hello, ${user.name}! 👋</h2>
        <p style="color: #64748b; font-size: 16px;">
          Thank you for registering as a <strong>${user.role}</strong>. 
          Please verify your email address to activate your account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background: #2563eb; color: white; padding: 14px 32px; 
                    border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
            ✅ Verify Email Address
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          This link expires in <strong>24 hours</strong>.<br>
          If you didn't register, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © Hospital Management System
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '✅ Verify Your Email — Hospital Management',
    html,
  });
};

// ── 2. Password Reset ────────────────────────────────
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const roleLabel = {
    admin: '⚙️ Admin',
    doctor: '👨‍⚕️ Doctor',
    patient: '🤒 Patient',
    receptionist: '🗂️ Receptionist',
    nurse: '👩‍⚕️ Nurse',
  }[user.role] || user.role;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Hospital Management</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #64748b;">
          Hello <strong>${user.name}</strong> (${roleLabel}),<br><br>
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background: #dc2626; color: white; padding: 14px 32px;
                    border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
            🔐 Reset My Password
          </a>
        </div>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⚠️ This link expires in <strong>15 minutes</strong>.<br>
            If you didn't request a password reset, please contact admin immediately.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © Hospital Management System
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔐 Password Reset Request — Hospital Management',
    html,
  });
};

// ── 3. Welcome Email (after verification) ───────────────
export const sendWelcomeEmail = async (user) => {
  const roleMessages = {
    admin: 'You have full access to manage the hospital system.',
    doctor: 'You can now manage your appointments and patient records.',
    patient: 'You can now book appointments and view your medical history.',
    receptionist: 'You can now manage appointments and patient check-ins.',
    nurse: 'You can now access patient care modules.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Hospital Management</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">🎉 Welcome, ${user.name}!</h2>
        <p style="color: #64748b; font-size: 16px;">
          Your email has been verified successfully. Your account is now active.<br><br>
          ${roleMessages[user.role] || 'Your account is ready.'}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login"
             style="background: #16a34a; color: white; padding: 14px 32px;
                    border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
            🚀 Go to Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © Hospital Management System
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🎉 Welcome to Hospital Management System!',
    html,
  });
};

// ── 4. Password Changed Confirmation ────────────────────
export const sendPasswordChangedEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #7c3aed; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Hospital Management</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">Password Changed ✅</h2>
        <p style="color: #64748b;">
          Hello <strong>${user.name}</strong>,<br><br>
          Your password has been changed successfully at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
        </p>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⚠️ If you did NOT make this change, contact admin immediately or call: <strong>+91-XXXXXXXXXX</strong>
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © Hospital Management System
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔒 Password Changed — Hospital Management',
    html,
  });
};
