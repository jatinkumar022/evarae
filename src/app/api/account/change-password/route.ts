import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { clearKeys, cacheKeys } from '@/lib/cache';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      console.error('[account/change-password] No token found in cookies');
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[account/change-password] JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again' },
        { status: 401 }
      );
    }

    if (!payload?.uid) {
      console.error('[account/change-password] No uid in payload:', payload);
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      newPassword: string;
      oldPassword?: string;
      otp?: string;
      method: 'password' | 'otp';
    };

    const { newPassword, oldPassword, otp, method } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await User.findById(payload.uid).select(
      '_id passwordHash loginOtpHash loginOtpExpiry loginOtpAttempts'
    );
    if (!user) {
      console.error('[account/change-password] User not found:', payload.uid);
      return NextResponse.json(
        { error: 'Account not found. Please log in again' },
        { status: 404 }
      );
    }

    // Check if user has a password (not Google sign-in)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Password change not available for Google sign-in accounts' },
        { status: 400 }
      );
    }

    // Verify old password or OTP
    if (method === 'password') {
      if (!oldPassword || typeof oldPassword !== 'string') {
        return NextResponse.json(
          { error: 'Please enter your current password' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Check if new password is different from old password
      const isNewPasswordSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isNewPasswordSame) {
        return NextResponse.json(
          { error: 'New password must be different from your current password' },
          { status: 400 }
        );
      }
    } else if (method === 'otp') {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json(
          { error: 'Please enter the OTP' },
          { status: 400 }
        );
      }

      // Check if OTP exists and is valid
      if (!user.loginOtpHash || !user.loginOtpExpiry) {
        return NextResponse.json(
          { error: 'No OTP found. Please request a new OTP' },
          { status: 400 }
        );
      }

      if (new Date() > new Date(user.loginOtpExpiry)) {
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one' },
          { status: 400 }
        );
      }

      const isOtpValid = await bcrypt.compare(otp, user.loginOtpHash);
      if (!isOtpValid) {
        // Increment OTP attempts
        user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
        if (user.loginOtpAttempts >= 5) {
          user.loginOtpHash = null;
          user.loginOtpExpiry = null;
          user.loginOtpAttempts = 0;
          await user.save();
          return NextResponse.json(
            { error: 'Too many failed attempts. Please request a new OTP' },
            { status: 429 }
          );
        }
        await user.save();
        return NextResponse.json(
          { error: 'Invalid OTP. Please try again' },
          { status: 401 }
        );
      }

      // Clear OTP after successful verification
      user.loginOtpHash = null;
      user.loginOtpExpiry = null;
      user.loginOtpAttempts = 0;

      // Check if new password is different from current password (for OTP method)
      const isNewPasswordSame = await bcrypt.compare(newPassword, user.passwordHash);
      if (isNewPasswordSame) {
        return NextResponse.json(
          { error: 'New password must be different from your current password' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid method. Please use password or OTP' },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();
    clearKeys([cacheKeys.userProfile(payload.uid)]);

    return NextResponse.json({ ok: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[account/change-password] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unable to change password. Please try again' },
      { status: 500 }
    );
  }
}

