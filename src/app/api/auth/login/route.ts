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
      console.error('[auth/login] USER_JWT_SECRET is not configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later' },
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
        { error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    // Optimize: Select only needed fields and use lean() for better performance
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id name email passwordHash')
      .lean<{ _id: Types.ObjectId; name: string; email: string; passwordHash: string | null } | null>();
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please check and try again' },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please check and try again' },
        { status: 401 }
      );
    }

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
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Unable to sign in. Please try again later' },
      { status: 500 }
    );
  }
}
