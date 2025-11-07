import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import PendingSignup from '@/models/pendingSignupModel';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const SIGNUP_JWT_SECRET = process.env.SIGNUP_JWT_SECRET as string;

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!SIGNUP_JWT_SECRET) {
      return createErrorResponse('Config error', 500);
    }

    await connect();
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      otp?: unknown;
    };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

    if (!email || !otp) {
      return createErrorResponse('Email and OTP are required', 400);
    }

    const pending = await PendingSignup.findOne({ email })
      .select('otpHash otpExpiry attempts email')
      .exec();

    if (!pending || !pending.otpHash || !pending.otpExpiry) {
      return createErrorResponse('Invalid OTP', 400);
    }
    if (new Date() > new Date(pending.otpExpiry)) {
      return createErrorResponse('OTP expired', 400);
    }
    if ((pending.attempts || 0) >= 5) {
      return createErrorResponse('Too many attempts', 429);
    }

    const valid = await bcrypt.compare(otp, pending.otpHash);
    pending.attempts = (pending.attempts || 0) + 1;
    if (!valid) {
      await pending.save();
      return createErrorResponse('Invalid OTP', 400);
    }

    // Issue short signup token for completing profile
    const signupToken = jwt.sign({ email: pending.email }, SIGNUP_JWT_SECRET, {
      expiresIn: '30m',
    });

    const response = createNoCacheResponse({ ok: true });
    response.cookies.set('signupToken', signupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60,
    });
    return response;
  } catch (error) {
    console.error('[auth/signup/verify-otp] Error:', error);
    return createErrorResponse('Unable to verify OTP. Please try again', 500);
  }
}
