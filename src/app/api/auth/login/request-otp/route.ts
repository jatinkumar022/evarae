import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { notifyUserOtp } from '@/lib/notify';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const OTP_EXP_MIN = 10;
const RESEND_COOLDOWN_SEC = 45;

export const runtime = 'nodejs';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    await connect();
    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return createErrorResponse('Email is required', 400);
    }

    const user = await User.findOne({ email })
      .select('name loginOtpHash loginOtpExpiry loginOtpAttempts loginOtpLastSentAt email')
      .exec();
    if (!user) {
      return createErrorResponse('No account found with this email. Please sign up first', 404);
    }

    if (user.loginOtpLastSentAt) {
      const diffSeconds = (Date.now() - new Date(user.loginOtpLastSentAt).getTime()) / 1000;
      if (diffSeconds < RESEND_COOLDOWN_SEC) {
        return createErrorResponse('Please wait before requesting a new OTP', 429);
      }
    }

    const otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);

    user.loginOtpHash = hash;
    user.loginOtpExpiry = new Date(Date.now() + OTP_EXP_MIN * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = new Date();
    await user.save();

    await notifyUserOtp({ email: user.email, name: user.name }, otp);

    return createNoCacheResponse({
      ok: true,
      message: 'OTP sent',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('[auth/login/request-otp] Error:', error);
    return createErrorResponse('Unable to send OTP. Please try again later', 500);
  }
}
