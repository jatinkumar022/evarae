import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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
      console.error('[account/change-password] USER_JWT_SECRET is not set');
      return createErrorResponse('Please log in to continue', 401);
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      console.error('[account/change-password] No token found in cookies');
      return createErrorResponse('Please log in to continue', 401);
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch (jwtError) {
      console.error('[account/change-password] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }

    if (!payload?.uid) {
      console.error('[account/change-password] No uid in payload:', payload);
      return createErrorResponse('Please log in to continue', 401);
    }

    const body = (await request.json().catch(() => null)) as
      | {
          newPassword?: unknown;
          oldPassword?: unknown;
          otp?: unknown;
          method?: unknown;
        }
      | null;

    if (!body) {
      return createErrorResponse('Invalid request payload', 400);
    }

    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword.trim() : '';
    const method = body.method === 'otp' ? 'otp' : 'password';
    const oldPassword =
      typeof body.oldPassword === 'string' ? body.oldPassword : undefined;
    const otp = typeof body.otp === 'string' ? body.otp.trim() : undefined;

    if (newPassword.length < 6) {
      return createErrorResponse('Password must be at least 6 characters long', 400);
    }

    const user = await User.findById(payload.uid)
      .select('passwordHash loginOtpHash loginOtpExpiry loginOtpAttempts name email')
      .exec();
    if (!user) {
      console.error('[account/change-password] User not found:', payload.uid);
      return createErrorResponse('Account not found. Please log in again', 404);
    }

    if (!user.passwordHash) {
      return createErrorResponse('Password change not available for Google sign-in accounts', 400);
    }

    if (method === 'password') {
      if (!oldPassword) {
        return createErrorResponse('Please enter your current password', 400);
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isPasswordValid) {
        return createErrorResponse('Current password is incorrect', 401);
      }

      const isNewPasswordSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isNewPasswordSame) {
        return createErrorResponse('New password must be different from your current password', 400);
      }
    } else if (method === 'otp') {
      if (!otp) {
        return createErrorResponse('Please enter the OTP', 400);
      }

      if (!user.loginOtpHash || !user.loginOtpExpiry) {
        return createErrorResponse('No OTP found. Please request a new OTP', 400);
      }

      if (new Date() > new Date(user.loginOtpExpiry)) {
        return createErrorResponse('OTP has expired. Please request a new one', 400);
      }

      const isOtpValid = await bcrypt.compare(otp, user.loginOtpHash);
      if (!isOtpValid) {
        user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
        if (user.loginOtpAttempts >= 5) {
          user.loginOtpHash = null;
          user.loginOtpExpiry = null;
          user.loginOtpAttempts = 0;
        }
        await user.save();

        if (user.loginOtpAttempts === 0) {
          return createErrorResponse('Too many failed attempts. Please request a new OTP', 429);
        }

        return createErrorResponse('Invalid OTP. Please try again', 401);
      }

      user.loginOtpHash = null;
      user.loginOtpExpiry = null;
      user.loginOtpAttempts = 0;

      const isNewPasswordSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isNewPasswordSame) {
        return createErrorResponse('New password must be different from your current password', 400);
      }
    } else {
      return createErrorResponse('Invalid method. Please use password or OTP', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    return createNoCacheResponse({ ok: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[account/change-password] Unexpected error:', error);
    return createErrorResponse('Unable to change password. Please try again', 500);
  }
}

