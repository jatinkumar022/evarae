import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { notifyPasswordChangeOtp } from '@/lib/notify';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const RESEND_COOLDOWN_SEC = 60; // 1 minute

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
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
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
      console.error('[account/request-password-otp] JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again' },
        { status: 401 }
      );
    }

    if (!payload?.uid) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    const user = await User.findById(payload.uid);
    if (!user) {
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

    // Check cooldown
    if (user.loginOtpLastSentAt) {
      const diff =
        (Date.now() - new Date(user.loginOtpLastSentAt).getTime()) / 1000;
      if (diff < RESEND_COOLDOWN_SEC) {
        return NextResponse.json(
          { error: `Please wait ${Math.ceil(RESEND_COOLDOWN_SEC - diff)} seconds before requesting a new OTP` },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Save OTP
    user.loginOtpHash = otpHash;
    user.loginOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = new Date();
    await user.save();

    // Send OTP via email
    await notifyPasswordChangeOtp({ email: user.email, name: user.name }, otp);

    const devOtp = process.env.NODE_ENV !== 'production' ? otp : undefined;

    return NextResponse.json({
      ok: true,
      message: 'OTP has been sent to your email',
      devOtp,
    });
  } catch (error) {
    console.error('[account/request-password-otp] Error:', error);
    return NextResponse.json(
      { error: 'Unable to send OTP. Please try again later' },
      { status: 500 }
    );
  }
}

