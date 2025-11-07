import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { notifyPasswordChangeOtp } from '@/lib/notify';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const RESEND_COOLDOWN_SEC = 60;

export const runtime = 'nodejs';

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map(p => p.trim())
    .find(p => p.startsWith(name + '='))
    ?.split('=')[1];
  return token || null;
}

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      console.error('[account/request-password-otp] USER_JWT_SECRET is not set');
      return createErrorResponse('Please log in to continue', 401);
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      return createErrorResponse('Please log in to continue', 401);
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch (jwtError) {
      console.error('[account/request-password-otp] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }

    if (!payload?.uid) {
      return createErrorResponse('Please log in to continue', 401);
    }

    const user = await User.findById(payload.uid)
      .select('email name passwordHash loginOtpHash loginOtpExpiry loginOtpAttempts loginOtpLastSentAt')
      .exec();
    if (!user) {
      return createErrorResponse('Account not found. Please log in again', 404);
    }

    if (!user.passwordHash) {
      return createErrorResponse('Password change not available for Google sign-in accounts', 400);
    }

    if (user.loginOtpLastSentAt) {
      const diffSeconds = (Date.now() - new Date(user.loginOtpLastSentAt).getTime()) / 1000;
      if (diffSeconds < RESEND_COOLDOWN_SEC) {
        return createErrorResponse(
          `Please wait ${Math.ceil(RESEND_COOLDOWN_SEC - diffSeconds)} seconds before requesting a new OTP`,
          429
        );
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.loginOtpHash = otpHash;
    user.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = new Date();
    await user.save();

    await notifyPasswordChangeOtp({ email: user.email, name: user.name }, otp);

    return createNoCacheResponse({
      ok: true,
      message: 'OTP has been sent to your email',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('[account/request-password-otp] Error:', error);
    return createErrorResponse('Unable to send OTP. Please try again later', 500);
  }
}

