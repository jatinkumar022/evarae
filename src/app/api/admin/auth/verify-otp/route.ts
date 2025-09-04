import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;
const ADMIN_SESSION_HOURS = 12;

if (!ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET missing in environment');
}

export async function POST(request: Request) {
  try {
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

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: 'admin',
    });
    if (!user || !user.adminOtpHash || !user.adminOtpExpiry) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > new Date(user.adminOtpExpiry)) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (user.adminOtpAttempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts. Request a new OTP.' },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(otp, user.adminOtpHash);

    user.adminOtpAttempts = (user.adminOtpAttempts || 0) + 1;

    if (!valid) {
      await user.save();
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Clear OTP fields after success
    // Using undefined so it fits stricter typing on the model
    user.adminOtpHash = undefined as unknown as string;
    user.adminOtpExpiry = undefined as unknown as Date;
    user.adminOtpAttempts = 0;
    await user.save();

    const token = jwt.sign({ uid: user._id, role: 'admin' }, ADMIN_JWT_SECRET, {
      expiresIn: `${ADMIN_SESSION_HOURS}h`,
    });

    const res = NextResponse.json({
      ok: true,
      admin: { id: user._id, name: user.name, email: user.email },
    });
    res.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_HOURS * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('verify-otp error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
