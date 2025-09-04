import nodemailer from 'nodemailer';

type NotifyTarget = {
  email: string;
  name?: string;
};

export async function notifyAdminOtp(
  target: NotifyTarget,
  otp: string
): Promise<void> {
  if (!target.email) return;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV OTP] Email:', target.email, 'OTP:', otp);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Caelvi Admin Security" <${process.env.EMAIL_USER}>`,
      to: target.email,
      subject: '🔐 Caelvi Admin OTP - Action Required',
      text: `Hi ${target.name || 'User'},
  
Your One-Time Password (OTP) is: ${otp}

This OTP will expire in 10 minutes. 
⚠️ Do not share this code with anyone, even Caelvi staff.

Login attempt details:
- Date/Time: ${new Date().toLocaleString()}
- IP Address: (detected automatically)
- Device/Browser: (detected automatically)

If this wasn't you, please contact Caelvi Security immediately.

Regards,  
Caelvi Security Team`,
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; background: #ffffff; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="text-align: center; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0;">
      <h1 style="color:#b76e79; margin: 0; font-size: 22px;">Caelvi Admin Security</h1>
      <p style="color:#444; font-size: 14px; margin-top: 5px;">🔒 Secure Login Authentication</p>
    </div>

    <!-- Body -->
    <div style="padding: 20px;">
      <p style="font-size: 16px; color:#222;">Hello <strong>${
        target.name || 'User'
      }</strong>,</p>
      <p style="font-size: 15px; color:#444;">We received a request to log in to your <strong>Caelvi Admin</strong> account. To continue, please use the One-Time Password (OTP) below:</p>

      <div style="font-size: 30px; font-weight: bold; color: #fff; background: linear-gradient(135deg,#b76e79,#d5a6bd); padding: 14px 30px; text-align:center; border-radius: 8px; margin: 20px auto; width: fit-content; letter-spacing: 4px;">
        ${otp}
      </div>

      <p style="font-size: 14px; color:#666; margin: 10px 0;">⏳ This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="font-size: 14px; color:#d9534f; font-weight: bold; margin: 5px 0;">⚠️ Important: Never share this OTP with anyone, including Caelvi staff.</p>

      <!-- Login Details -->
      <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee;">
        <h3 style="margin:0 0 10px 0; font-size: 15px; color:#333;">📋 Login Attempt Details</h3>
        <p style="font-size: 13px; margin: 4px 0; color:#555;">• Date/Time: <strong>${new Date().toLocaleString()}</strong></p>
        <p style="font-size: 13px; margin: 4px 0; color:#555;">• IP Address: <strong>[Auto-Detected]</strong></p>
        <p style="font-size: 13px; margin: 4px 0; color:#555;">• Device/Browser: <strong>[Auto-Detected]</strong></p>
        <p style="font-size: 12px; margin: 8px 0; color:#999;">If this login attempt looks suspicious, please reset your password immediately.</p>
      </div>

      <!-- Warning Box -->
      <div style="margin-top: 20px; padding: 12px; border-left: 4px solid #d9534f; background: #fff5f5; border-radius: 6px;">
        <p style="font-size: 13px; margin:0; color:#d9534f; font-weight: bold;">🚨 Security Notice:</p>
        <p style="font-size: 13px; margin:4px 0; color:#444;">Caelvi will <u>never</u> ask you to share your OTP over phone, email, or chat. If anyone asks, it’s a scam.</p>
      </div>

    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #f0f0f0; margin-top: 20px; padding-top: 12px; text-align: center; font-size: 12px; color:#888;">
      <p>If this wasn’t you, please contact <a href="mailto:support@caelvi.com" style="color:#b76e79; text-decoration:none;">support@caelvi.com</a> immediately.</p>
      <p>© ${new Date().getFullYear()} Caelvi. All rights reserved.</p>
    </div>
  </div>
  `,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] OTP email sent:', info.messageId);
    }
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err);
  }
}
