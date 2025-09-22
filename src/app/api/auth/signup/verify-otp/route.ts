import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import PendingSignup from '@/models/pendingSignupModel';

const SIGNUP_JWT_SECRET = process.env.SIGNUP_JWT_SECRET as string;

export async function POST(request: Request) {
  try {
    if (!SIGNUP_JWT_SECRET) {
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    await connect();
    const { email, otp } = await request.json();
    if (
      !email ||
      typeof email !== 'string' ||
      !otp ||
      typeof otp !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const pending = await PendingSignup.findOne({ email: email.toLowerCase() });
    if (!pending || !pending.otpHash || !pending.otpExpiry) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
    if (new Date() > new Date(pending.otpExpiry)) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }
    if (pending.attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const valid = await bcrypt.compare(otp, pending.otpHash);
    pending.attempts = (pending.attempts || 0) + 1;
    if (!valid) {
      await pending.save();
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Issue short signup token for completing profile
    const signupToken = jwt.sign({ email: pending.email }, SIGNUP_JWT_SECRET, {
      expiresIn: '30m',
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('signupToken', signupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60,
    });
    return res;
  } catch (error) {
    console.error('signup verify-otp error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
