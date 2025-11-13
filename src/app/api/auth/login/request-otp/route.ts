import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { notifyUserOtp } from '@/lib/notify';
import type { Types } from 'mongoose';

const OTP_EXP_MIN = 10;
const RESEND_COOLDOWN_SEC = 45;

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

    const normalized = email.toLowerCase();
    
    // Optimize: Select only needed fields
    const user = await User.findOne({ email: normalized })
      .select('_id name email loginOtpLastSentAt')
      .lean<{ _id: Types.ObjectId; name: string; email: string; loginOtpLastSentAt?: Date } | null>();
    
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first' },
        { status: 404 }
      );
    }

    if (user.loginOtpLastSentAt) {
      const diff =
        (Date.now() - new Date(user.loginOtpLastSentAt).getTime()) / 1000;
      if (diff < RESEND_COOLDOWN_SEC) {
        return NextResponse.json(
          { error: 'Please wait before requesting a new OTP' },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);
    
    // Optimize: Use updateOne instead of save for better performance
    await User.updateOne(
      { email: normalized },
      {
        loginOtpHash: hash,
        loginOtpExpiry: new Date(Date.now() + OTP_EXP_MIN * 60 * 1000),
        loginOtpAttempts: 0,
        loginOtpLastSentAt: new Date(),
      }
    );

    await notifyUserOtp({ email: normalized, name: user.name }, otp);

    const res = NextResponse.json({
      ok: true,
      message: 'OTP sent',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
    return res;
  } catch (error) {
    console.error('[auth/login/request-otp] Error:', error);
    return NextResponse.json(
      { error: 'Unable to send OTP. Please try again later' },
      { status: 500 }
    );
  }
}
