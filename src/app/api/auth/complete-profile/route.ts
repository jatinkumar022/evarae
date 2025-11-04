import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';
import PendingSignup from '@/models/pendingSignupModel';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SIGNUP_JWT_SECRET = process.env.SIGNUP_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

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
    await connect();

    const { name, phone, password } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Valid 10-digit phone is required' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 chars' },
        { status: 400 }
      );
    }

    const userToken = USER_JWT_SECRET ? getCookie(request, 'token') : null;
    const signupToken = SIGNUP_JWT_SECRET
      ? getCookie(request, 'signupToken')
      : null;

    // ✅ Case 1: Existing logged-in user completing profile
    if (userToken && USER_JWT_SECRET) {
      const payload = jwt.verify(userToken, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
      if (!payload?.uid) {
        return NextResponse.json(
          { error: 'Your session has expired. Please log in again' },
          { status: 401 }
        );
      }

      const user = await User.findById(payload.uid);
      if (!user) {
        return NextResponse.json(
          { error: 'Account not found. Please sign up again' },
          { status: 404 }
        );
      }

      user.name = name;
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();

      // Save phone number to UserProfile
      const normalizedPhone = phone.replace(/\D/g, '').slice(0, 10);
      await UserProfile.findOneAndUpdate(
        { user: user._id },
        { $set: { user: user._id, phone: normalizedPhone } },
        { new: true, upsert: true }
      );

      return NextResponse.json({ ok: true });
    }

    // ✅ Case 2: New signup flow with signupToken
    if (signupToken && SIGNUP_JWT_SECRET) {
      const payload = jwt.verify(signupToken, SIGNUP_JWT_SECRET) as {
        email?: string;
      } | null;
      if (!payload?.email) {
        return NextResponse.json(
          { error: 'Your signup session has expired. Please start again' },
          { status: 401 }
        );
      }

      const email = payload.email.toLowerCase();
      const exists = await User.exists({ email });
      if (exists)
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );

      const user = await User.create({
        name,
        email,
        isVerified: true,
        passwordHash: await bcrypt.hash(password, 10),
      });

      // Save phone number to UserProfile
      const normalizedPhone = phone.replace(/\D/g, '').slice(0, 10);
      await UserProfile.create({
        user: user._id,
        phone: normalizedPhone,
      });

      // Remove pending signup
      await PendingSignup.deleteOne({ email });

      // Issue login token
      const token = jwt.sign({ uid: user._id, role: 'user' }, USER_JWT_SECRET, {
        expiresIn: `${SESSION_HOURS}h`,
      });

      const res = NextResponse.json({
        ok: true,
        user: { id: user._id, name: user.name, email: user.email },
      });

      // Set real login cookie
      res.cookies.set('token', token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false,
        path: '/',
        maxAge: SESSION_HOURS * 60 * 60,
      });

      // Clear signupToken cookie
      res.cookies.set('signupToken', '', { maxAge: 0 });

      return res;
    }

    return NextResponse.json(
      { error: 'Please complete signup to continue' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[auth/complete-profile] Error:', error);
    return NextResponse.json(
      { error: 'Unable to complete profile. Please try again' },
      { status: 500 }
    );
  }
}
