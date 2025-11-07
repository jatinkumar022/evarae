import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import PendingSignup from '@/models/pendingSignupModel';
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

    const exists = await User.exists({ email });
    if (exists) {
      return createErrorResponse('This email is already registered. Please log in instead', 400);
    }

    let pending = await PendingSignup.findOne({ email })
      .select('otpHash otpExpiry attempts lastSentAt email')
      .exec();

    if (pending?.lastSentAt) {
      const diffSeconds = (Date.now() - new Date(pending.lastSentAt).getTime()) / 1000;
      if (diffSeconds < RESEND_COOLDOWN_SEC) {
        return createErrorResponse('Please wait before requesting a new OTP', 429);
      }
    }

    const otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);

    if (!pending) {
      pending = await PendingSignup.create({
        email,
        otpHash: hash,
        otpExpiry: new Date(Date.now() + OTP_EXP_MIN * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      });
    } else {
      pending.otpHash = hash;
      pending.otpExpiry = new Date(Date.now() + OTP_EXP_MIN * 60 * 1000);
      pending.attempts = 0;
      pending.lastSentAt = new Date();
      await pending.save();
    }

    await notifyUserOtp({ email, name: 'User' }, otp);

    return createNoCacheResponse({
      ok: true,
      message: 'OTP sent',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('[auth/signup/request-otp] Error:', error);
    return createErrorResponse('Unable to send OTP. Please try again later', 500);
  }
}
