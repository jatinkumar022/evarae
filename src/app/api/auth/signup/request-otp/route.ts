import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import PendingSignup from '@/models/pendingSignupModel';
import { notifyUserOtp } from '@/lib/notify';

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

    // Optimize: Check existence and fetch pending in parallel
    const [exists, pending] = await Promise.all([
      User.exists({ email: normalized }).lean(),
      PendingSignup.findOne({ email: normalized })
        .select('lastSentAt')
        .lean<{ lastSentAt?: Date } | null>(),
    ]);
    
    if (exists) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead' },
        { status: 400 }
      );
    }
    
    if (pending?.lastSentAt) {
      const diff = (Date.now() - new Date(pending.lastSentAt).getTime()) / 1000;
      if (diff < RESEND_COOLDOWN_SEC) {
        return NextResponse.json(
          { error: 'Please wait before requesting a new OTP' },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const hash = await bcrypt.hash(otp, 10);

    // Optimize: Use findOneAndUpdate with upsert for atomic operation
    await PendingSignup.findOneAndUpdate(
      { email: normalized },
      {
        email: normalized,
        otpHash: hash,
        otpExpiry: new Date(Date.now() + OTP_EXP_MIN * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await notifyUserOtp({ email: normalized, name: 'User' }, otp);

    return NextResponse.json({
      ok: true,
      message: 'OTP sent',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('[auth/signup/request-otp] Error:', error);
    return NextResponse.json(
      { error: 'Unable to send OTP. Please try again later' },
      { status: 500 }
    );
  }
}
