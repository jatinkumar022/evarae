import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      return NextResponse.json(
        { error: 'USER_JWT_SECRET not configured' },
        { status: 500 }
      );
    }

    await connect();
    const { email, password } = await request.json();

    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ uid: user._id, role: 'user' }, USER_JWT_SECRET, {
      expiresIn: `${SESSION_HOURS}h`,
    });

    const res = NextResponse.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email },
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
    console.error('user login error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
