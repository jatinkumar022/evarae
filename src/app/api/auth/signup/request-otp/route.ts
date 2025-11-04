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

    const exists = await User.exists({ email: normalized });
    if (exists) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead' },
        { status: 400 }
      );
    }

    let pending = await PendingSignup.findOne({ email: normalized });
    if (pending && pending.lastSentAt) {
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

    if (!pending) {
      pending = await PendingSignup.create({
        email: normalized,
        otpHash: hash,
        otpExpiry: new Date(Date.now() + OTP_EXP_MIN * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      });
    } else {
      pending.otpHash = hash as unknown as string;
      pending.otpExpiry = new Date(
        Date.now() + OTP_EXP_MIN * 60 * 1000
      ) as unknown as Date;
      pending.attempts = 0 as unknown as number;
      pending.lastSentAt = new Date() as unknown as Date;
      await pending.save();
    }

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
