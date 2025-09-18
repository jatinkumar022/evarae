import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { notifyAdminOtp } from '@/lib/notify';

const OTP_TTL_MINUTES = 10;
const RESEND_WINDOW_SECONDS = 45;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    await connect();
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: 'admin',
    });

    // Always respond same way to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: 'If this email exists, OTP has been sent',
      });
    }

    const now = new Date();
    if (user.adminOtpLastSentAt) {
      const secondsSinceLast =
        (now.getTime() - new Date(user.adminOtpLastSentAt).getTime()) / 1000;
      if (secondsSinceLast < RESEND_WINDOW_SECONDS) {
        const wait = Math.ceil(RESEND_WINDOW_SECONDS - secondsSinceLast);
        return NextResponse.json(
          { error: `Please wait ${wait}s before requesting another OTP` },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(otp, salt);

    user.adminOtpHash = hash;
    user.adminOtpExpiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    user.adminOtpAttempts = 0;
    user.adminOtpLastSentAt = now;
    await user.save();

    await notifyAdminOtp({ email: user.email, name: user.name }, otp);

    return NextResponse.json({
      ok: true,
      message: 'If this email exists, OTP has been sent',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('request-otp error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
