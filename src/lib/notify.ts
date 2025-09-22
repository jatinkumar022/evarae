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

export async function notifyUserOtp(
  target: NotifyTarget,
  otp: string
): Promise<void> {
  if (!target.email) return;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV OTP - USER] Email:', target.email, 'OTP:', otp);
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
      from: `"Caelvi Security" <${process.env.EMAIL_USER}>`,
      to: target.email,
      subject: '🔐 Caelvi Login Verification - Your Secure Access Code',
      text: `Hi ${target.name || 'Valued User'},

Your secure One-Time Password (OTP) for Caelvi login is: ${otp}

⏰ This verification code expires in 10 minutes
🔒 Keep this code confidential - never share it with anyone
🛡️ If you didn't request this login, please secure your account immediately

For support: support@caelvi.com

Best regards,
The Caelvi Security Team`,

      html: `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Caelvi — Login Verification</title>
  <style type="text/css">
    /* Keep all original CSS exactly */
    body,
    table,
    td,
    p,
    a,
    li,
    blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    .font-primary {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }

    .font-mono {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace !important;
    }

    .container {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
    }

    .center-align {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .content-wrapper {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(183, 110, 121, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }

    .header-section {
      background: linear-gradient(135deg, #b76e79 0%, #c8869a 35%, #d5a6bd 70%, #e1c2d1 100%);
      padding: 50px 40px;
      text-align: center;
      color: #ffffff;
      position: relative;
    }

    .brand-icon {
      width: 120px;
      height: 120px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.15);
      margin: 0 auto 20px;
      display: inline-block;
      position: relative;
      border: 2px solid rgba(255, 255, 255, 0.25);
    }

    .hero-title {
      margin: 0 0 12px;
      font-size: 36px;
      font-weight: 500;
      letter-spacing: -1px;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .hero-subtitle {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .main-content {
      padding: 45px 50px;
    }

    .section-title {
      margin: 0 0 16px;
      font-size: 28px;
      color: #1a202c;
      font-weight: 700;
      line-height: 1.3;
      text-align: center;
    }

    .welcome-text {
      margin: 0;
      color: #4a5568;
      font-size: 17px;
      font-weight: 400;
      text-align: center;
    }

    .otp-container {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 40px 30px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      text-align: center;
      margin: 30px auto;
      max-width: 550px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .otp-badge {
      background: rgba(183, 110, 121, 0.15);
      padding: 12px 24px;
      border-radius: 50px;
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .otp-badge-text {
      color: #b76e79;
      font-size: 16px;
      font-weight: 700;
    }

    .otp-subtext {
      margin: 0;
      color: #475569;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .otp-code {
      background: rgb(187 187 187 / 25%);
      border-radius: 18px;
      padding: 32px 28px;
      font-size: 48px;
      font-weight: 700;
      letter-spacing: 14px;
      color: #b76e79;
      display: inline-block;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 20px;
      text-align: center;
      width: fit-content;
      min-width: 280px;
    }

    .timer-badge {
      background: linear-gradient(135deg, #fff0f5, #fde2f2);
      color: #92400e;
      padding: 12px 24px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 14px;
      border: 1px solid rgba(251, 191, 36, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .instructions-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 30px;
      border: 1px solid #e2e8f0;
      margin: 30px 0;
    }

    .instruction-header {
      margin-bottom: 20px;
    }

    .instruction-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #b76e79, #d5a6bd);
      border-radius: 8px;
      display: inline-block;
      text-align: center;
      line-height: 36px;
      margin-right: 12px;
      vertical-align: top;
    }

    .instruction-title {
      margin: 0;
      font-size: 18px;
      color: #1e293b;
      font-weight: 700;
      display: inline-block;
      vertical-align: top;
      line-height: 36px;
    }

    .step-card {
      background: #ffffff;
      border-radius: 12px;
      display: flex;
      padding: 18px;
      border-left: 4px solid #b76e79;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 12px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #b76e79, #d5a6bd);
      color: #ffffff;
      font-weight: 500;
      font-size: 14px;
      display: inline-block;
      text-align: center;
      line-height: 32px;
      margin-right: 14px;
      vertical-align: top;
    }

    .step-content {
      display: inline-block;
      vertical-align: top;
      width: calc(100% - 50px);
    }

    .step-title {
      font-weight: 700;
      color: #1e293b;
      font-size: 15px;
      margin: 0 0 4px;
    }

    .step-description {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }

    .alerts-grid {
      margin: 30px 0;
    }

    .alert-card {
      border-radius: 14px;
      padding: 22px;
      text-align: center;
      position: relative;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .alert-warning {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 2px solid #d5a6bd;
    }

    .alert-caution {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 2px solid #fbbf24;
    }

    .alert-icon {
      font-size: 32px;
      margin-bottom: 10px;
      display: block;
    }

    .alert-title {
      font-weight: 500;
      font-size: 16px;
      margin-bottom: 6px;
    }

    .alert-text {
      font-size: 13px;
      line-height: 1.5;
      font-weight: 500;
    }

    .alert-warning .alert-title {
      color: #d5a6bd;
    }

    .alert-warning .alert-text {
      color: #991b1b;
    }

    .alert-caution .alert-title {
      color: #d97706;
    }

    .alert-caution .alert-text {
      color: #92400e;
    }

    .button-primary {
      background: linear-gradient(135deg, #b76e79 0%, #c8869a 30%, #d5a6bd 100%);
      color: #ffffff !important;
      padding: 16px 38px;
      border-radius: 50px;
      font-weight: 500;
      font-size: 15px;
      text-decoration: none;
      box-shadow: 0 8px 28px rgba(183, 110, 121, 0.2);
      margin: 8px 10px;
      display: inline-block;
    }

    .button-secondary {
      background: rgba(183, 110, 121, 0.1);
      color: #b76e79 !important;
      padding: 16px 38px;
      border-radius: 50px;
      font-weight: 500;
      font-size: 15px;
      text-decoration: none;
      border: 2px solid #b76e79;
      margin: 8px 10px;
      display: inline-block;
    }

    .support-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 30px;
      border: 1px solid #e2e8f0;
      margin: 30px 0;
    }

    .support-grid {
      width: 100%;
      table-layout: fixed;
    }

    .support-item {
      background: rgba(183, 110, 121, 0.08);
      border-radius: 12px;
      padding: 18px 10px;
      text-align: center;
      color: #b76e79 !important;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid rgba(183, 110, 121, 0.1);
      display: block;
    }

    .support-icon {
      font-size: 26px;
      margin-bottom: 6px;
      display: block;
    }

    .support-title {
      font-size: 14px;
      margin-bottom: 2px;
    }

    .support-subtitle {
      font-size: 11px;
      color: #8b5773;
      font-weight: 500;
    }

    .footer-section {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 13px;
      line-height: 1.6;
    }

    .footer-link {
      color: #94a3b8 !important;
      text-decoration: none;
      margin: 0 8px;
      font-size: 11px;
    }

    @media only screen and (max-width:600px) {
      .container {
        width: 100% !important;
        padding: 16px !important;
      }

      .main-content {
        padding: 30px 25px !important;
      }

      .hero-title {
        font-size: 28px !important;
      }

      .hero-subtitle {
        font-size: 14px !important;
      }

      .section-title {
        font-size: 22px !important;
      }

      .otp-code {
        font-size: 36px !important;
        letter-spacing: 8px !important;
        padding: 22px 18px !important;
      }

      .step-content {
        width: calc(100% - 45px) !important;
      }

      .button-primary,
      .button-secondary {
        display: block !important;
        margin: 10px auto !important;
        width: 80% !important;
        text-align: center !important;
      }

      .support-grid td {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      .content-wrapper {
        background: #1f2937 !important;
      }

      .section-title {
        color: #f9fafb !important;
      }

      .welcome-text {
        color: #d1d5db !important;
      }
    }
  </style>
</head>

<body
  style="margin:0; padding:0; background-color:#f7f3f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; color:#2d3748; line-height:1.6;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f7f3f5;">
    <tr>
      <td align="center" style="padding:30px 16px;">

        <table class="container" width="720" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:720px; width:100%;">

          <tr>
            <td>

              <!-- Wrapper -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background-color:#ffffff; border:1px solid #ffffff; border-radius:20px;">

                <!-- Header -->
                <tr>
                  <td align="center" style="padding:50px 40px; background-color:#c8869a; color:#ffffff;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td align="center"
                          style="width:120px; height:120px; border-radius:20px; background-color:rgba(255,255,255,0.15); position:relative;">
                          <div style="font-size:50px; line-height:1; text-align:center;">🛡️</div>

                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:20px 0 12px; font-size:36px; font-weight:500;">Caelvi</h1>
                    <p style="margin:0; font-size:16px; font-weight:500; opacity:0.95;">Enterprise Security
                      Authentication</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding:45px 50px;">

                    <h2 style="text-align:center; font-size:28px; font-weight:700; color:#1a202c;">🔐 Identity
                      Verification Required</h2>
                    <p style="text-align:center; font-size:16px; color:#4a5568; max-width:480px; margin:20px auto;">
                      Hello <strong style="color:#b76e79; font-weight:600;">${
                        target.name || 'Valued User'
                      }</strong>,
                      we've received a secure login request for your account and need to verify your identity. Please
                      use the code below to complete authentication safely.
                    </p>

                    <!-- OTP Section -->
                    <table align="center" cellpadding="0" cellspacing="0" role="presentation"
                      style="background-color:#fff; border:1px solid #fff; border-radius:20px; padding:40px 30px; text-align:center; margin:30px auto; width:100%; max-width:550px;">
                      <tr>
                        <td>
                          <div style="margin-bottom:12px;">
                            <span style="font-size:20px;">🔑</span>
                            <span style="color:#b76e79; font-weight:700; font-size:16px;">Authentication Code</span>
                          </div>
                          <p style="font-size:14px; color:#475569; margin-bottom:20px;">Enter this code within the next
                            10 minutes</p>
                          <div
                            style="background-color:rgba(187,187,187,0.25); border-radius:18px; padding:32px 28px; font-size:48px; font-weight:700; letter-spacing:14px; color:#b76e79; display:inline-block; min-width:280px; margin-bottom:20px;"
                            role="text" aria-label="Your one time passcode is ${otp}">${otp}</div>
                          <div
                            style="display:inline-block; background-color:#fff0f5; color:#92400e; padding:12px 24px; border-radius:50px; font-weight:700; font-size:14px; border:1px solid rgba(251,191,36,0.3);">
                            <span style="font-size:16px;">⏱️</span> Expires in 10 minutes
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Instructions -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                      style="margin-top:30px; background-color:#f1f5f9; border-radius:16px; padding:30px; border:1px solid #e2e8f0;">
                      <tr>
                        <td>
                          <div style="margin-bottom:20px;">
                            <span
                              style="width:36px; height:36px; display:inline-block; text-align:center; line-height:36px; background-color:#b76e79; color:#fff; border-radius:8px;">📝</span>
                            <h3
                              style="display:inline-block; vertical-align:top; line-height:36px; font-size:18px; font-weight:700; color:#1e293b; margin:0 0 0 12px;">
                              How to Complete Login</h3>
                          </div>

                          <!-- Step Cards -->
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding-bottom:12px;">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                                  style="background-color:#ffffff; border-left:4px solid #b76e79; border-radius:12px; padding:18px;">
                                  <tr>
                                    <!-- Step Number -->
                                    <td width="40" align="center" valign="middle">
                                      <table width="32" height="32" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:linear-gradient(135deg,#b76e79,#d5a6bd); border-radius:50%;">
                                        <tr>
                                          <td align="center" valign="middle"
                                            style="color:#fff; font-weight:500; font-size:14px;">
                                            1
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="padding-left:14px;">
                                      <strong style="font-size:15px; color:#1e293b;">🌐 Return to Login Page</strong>
                                      <p style="font-size:13px; color:#64748b; margin:4px 0 0;">Go back to the Caelvi
                                        authentication screen where you started the login process</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:12px;">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                                  style="background-color:#ffffff; border-left:4px solid #b76e79; border-radius:12px; padding:18px;">
                                  <tr>
                                    <!-- Step Number -->
                                    <td width="40" align="center" valign="middle">
                                      <table width="32" height="32" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:linear-gradient(135deg,#b76e79,#d5a6bd); border-radius:50%;">
                                        <tr>
                                          <td align="center" valign="middle"
                                            style="color:#fff; font-weight:500; font-size:14px;">
                                            2
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="padding-left:14px;">
                                      <strong style="font-size:15px; color:#1e293b;">⌨️ Input Verification Code</strong>
                                      <p style="font-size:13px; color:#64748b; margin:4px 0 0;">Carefully enter the
                                        6-digit code shown above into the verification field</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                                  style="background-color:#ffffff; border-left:4px solid #b76e79; border-radius:12px; padding:18px;">
                                  <tr>
                                    <!-- Step Number -->
                                    <td width="40" align="center" valign="middle">
                                      <table width="32" height="32" cellpadding="0" cellspacing="0" role="presentation"
                                        style="background:linear-gradient(135deg,#b76e79,#d5a6bd); border-radius:50%;">
                                        <tr>
                                          <td align="center" valign="middle"
                                            style="color:#fff; font-weight:500; font-size:14px;">
                                            3
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="padding-left:14px;">
                                      <strong style="font-size:15px; color:#1e293b;">✅ Access Your Account</strong>
                                      <p style="font-size:13px; color:#64748b; margin:4px 0 0;">Click submit to complete
                                        authentication and securely access your Caelvi dashboard</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Alerts -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:30px;">
                      <tr>
                        <td width="48%" style="padding-right:12px; vertical-align:top;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                            style="background-color:#fef2f254; border:2px solid #d5a6bd; border-radius:14px; padding:22px; text-align:center;">
                            <tr>
                              <td>
                                <div style="font-size:32px; margin-bottom:10px;">🔒</div>
                                <strong style="font-weight:500; font-size:16px; color:#d5a6bd;">Keep It Private</strong>
                                <p style="font-size:13px; color:#991b1b; margin:6px 0 0;">This code is confidential.
                                  Never share it with anyone, including our support team.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="48%" style="padding-left:12px; vertical-align:top;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                            style="background-color:#fffbeb; border:2px solid #fbbf24; border-radius:14px; padding:22px; text-align:center;">
                            <tr>
                              <td>
                                <div style="font-size:32px; margin-bottom:10px;">🛡️</div>
                                <strong style="font-weight:500; font-size:16px; color:#d97706;">Not Your
                                  Request?</strong>
                                <p style="font-size:13px; color:#92400e; margin:6px 0 0;">If you didn't initiate this
                                  login, please secure your account right away.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                      style="margin-top:30px; text-align:center;">
                      <tr>
                        <td>
                          <a href="#"
                            style="background-color:#b76e79; color:#ffffff; text-decoration:none; padding:16px 38px; border-radius:50px; font-weight:500; font-size:15px; display:inline-block; margin:8px;">🚀
                            Continue to Login</a>
                          <a href="mailto:support@caelvi.com"
                            style="background-color:rgba(183,110,121,0.1); color:#b76e79; text-decoration:none; padding:16px 38px; border-radius:50px; font-weight:500; font-size:15px; display:inline-block; border:2px solid #b76e79; margin:8px;">💬
                            Need Help?</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Support Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                      style="margin-top:30px; background-color:#f1f5f9; border:1px solid #e2e8f0; border-radius:16px; padding:30px;">
                      <tr>
                        <td align="center" style="margin-bottom:20px;">
                          <h4 style="margin:0 0 6px; font-size:20px; font-weight:500; color:#1e293b;">🎯 Support &
                            Resources</h4>
                          <p style="margin:0; font-size:14px; color:#64748b;">Get help when you need it most</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td width="33.33%" style="padding:6px;">
                                <a href="mailto:support@caelvi.com"
                                  style="background-color:rgba(183,110,121,0.08); border-radius:12px; padding:18px 10px; text-align:center; display:block; color:#b76e79; font-weight:700; text-decoration:none; border:1px solid rgba(183,110,121,0.1);">
                                  <div style="font-size:26px; margin-bottom:6px;">📧</div>
                                  <div style="font-size:14px;">Email Support</div>
                                  <div style="font-size:11px; color:#8b5773; font-weight:500;">24/7 Available</div>
                                </a>
                              </td>
                              <td width="33.33%" style="padding:6px;">
                                <a href="#"
                                  style="background-color:rgba(183,110,121,0.08); border-radius:12px; padding:18px 10px; text-align:center; display:block; color:#b76e79; font-weight:700; text-decoration:none; border:1px solid rgba(183,110,121,0.1);">
                                  <div style="font-size:26px; margin-bottom:6px;">❓</div>
                                  <div style="font-size:14px;">Help Center</div>
                                  <div style="font-size:11px; color:#8b5773; font-weight:500;">FAQs & Guides</div>
                                </a>
                              </td>
                              <td width="33.33%" style="padding:6px;">
                                <a href="#"
                                  style="background-color:rgba(183,110,121,0.08); border-radius:12px; padding:18px 10px; text-align:center; display:block; color:#b76e79; font-weight:700; text-decoration:none; border:1px solid rgba(183,110,121,0.1);">
                                  <div style="font-size:26px; margin-bottom:6px;">🔐</div>
                                  <div style="font-size:14px;">Security Hub</div>
                                  <div style="font-size:11px; color:#8b5773; font-weight:500;">Best Practices</div>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Footer -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                      style="margin-top:30px; border-top:1px solid #e2e8f0; color:#64748b; font-size:13px; line-height:1.6; text-align:center;">

                      <!-- Spacer -->
                      <tr>
                        <td height="16">&nbsp;</td>
                      </tr>

                      <!-- Security Notification -->
                      <tr>
                        <td>
                          <span style="font-size:14px;">🔒</span>
                          <span style="font-weight:600; font-size:13px;">This is an automated security notification from
                            Caelvi</span>
                        </td>
                      </tr>

                      <!-- Spacer -->
                      <tr>
                        <td height="12">&nbsp;</td>
                      </tr>

                      <!-- Sent Date -->
                      <tr>
                        <td style="font-size:12px; color:#94a3b8;">
                          📅 Sent on ${new Date().toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short',
                          })}
                        </td>
                      </tr>

                      <!-- Spacer -->
                      <tr>
                        <td height="12">&nbsp;</td>
                      </tr>

                      <!-- Links -->
                      <tr>
                        <td>
                          <a href="#" style="color:#94a3b8; text-decoration:none; font-size:11px; margin:0 8px;">Privacy
                            Policy</a> |
                          <a href="#" style="color:#94a3b8; text-decoration:none; font-size:11px; margin:0 8px;">Terms
                            of Service</a> |
                          <a href="#"
                            style="color:#94a3b8; text-decoration:none; font-size:11px; margin:0 8px;">Security
                            Center</a>
                        </td>
                      </tr>

                      <!-- Spacer -->
                      <tr>
                        <td height="12">&nbsp;</td>
                      </tr>

                      <!-- Copyright -->
                      <tr>
                        <td style="color:#cbd5e1; font-size:11px; font-weight:500;">
                          © ${new Date().getFullYear()} Caelvi Technologies. All rights reserved.
                        </td>
                      </tr>

                      <!-- Spacer -->
                      <tr>
                        <td height="16">&nbsp;</td>
                      </tr>

                    </table>

                  </td>
                </tr>

              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>

</html>
      `,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Email-optimized OTP template sent:', info.messageId);
    }
  } catch (err) {
    console.error('❌ Failed to send user OTP email:', err);
  }
}
