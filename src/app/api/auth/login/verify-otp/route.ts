import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import type { Types } from 'mongoose';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
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

    // Optimize: Select only needed fields
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id name email loginOtpHash loginOtpExpiry loginOtpAttempts')
      .lean<{
        _id: Types.ObjectId;
        name: string;
        email: string;
        loginOtpHash?: string;
        loginOtpExpiry?: Date;
        loginOtpAttempts?: number;
      } | null>();
    
    if (!user || !user.loginOtpHash || !user.loginOtpExpiry) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > new Date(user.loginOtpExpiry)) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if ((user.loginOtpAttempts || 0) >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Request a new OTP.' },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(otp, user.loginOtpHash);

    if (!valid) {
      // Optimize: Use updateOne instead of save
      await User.updateOne(
        { email: email.toLowerCase() },
        { $inc: { loginOtpAttempts: 1 } }
      );
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Clear OTP fields after successful verification
    await User.updateOne(
      { email: email.toLowerCase() },
      {
        $unset: { loginOtpHash: '', loginOtpExpiry: '' },
        $set: { loginOtpAttempts: 0 },
      }
    );

    const token = jwt.sign({ uid: user._id, role: 'user' }, USER_JWT_SECRET, {
      expiresIn: `${SESSION_HOURS}h`,
    });

    const res = NextResponse.json({
      ok: true,
      user: { id: String(user._id), name: user.name, email: user.email },
    });
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production' ? true : false,

      path: '/',
      maxAge: SESSION_HOURS * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('[auth/login/verify-otp] Error:', error);
    return NextResponse.json(
      { error: 'Unable to verify OTP. Please try again' },
      { status: 500 }
    );
  }
}
