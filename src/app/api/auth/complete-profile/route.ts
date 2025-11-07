import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';
import PendingSignup from '@/models/pendingSignupModel';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SIGNUP_JWT_SECRET = process.env.SIGNUP_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

export const runtime = 'nodejs';

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

    const body = (await request.json().catch(() => null)) as
      | {
          name?: unknown;
          phone?: unknown;
          password?: unknown;
        }
      | null;

    if (!body) {
      return createErrorResponse('Invalid request payload', 400);
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phoneRaw = typeof body.phone === 'string' ? body.phone : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name) {
      return createErrorResponse('Name is required', 400);
    }
    if (!/^\d{10}$/.test(phoneRaw)) {
      return createErrorResponse('Valid 10-digit phone is required', 400);
    }
    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 chars', 400);
    }

    const normalizedPhone = phoneRaw.replace(/\D/g, '').slice(0, 10);

    const userToken = USER_JWT_SECRET ? getCookie(request, 'token') : null;
    const signupToken = SIGNUP_JWT_SECRET ? getCookie(request, 'signupToken') : null;

    if (userToken && USER_JWT_SECRET) {
      let payload: { uid?: string } | null = null;
      try {
        payload = jwt.verify(userToken, USER_JWT_SECRET) as { uid?: string } | null;
      } catch {
        return createErrorResponse('Your session has expired. Please log in again', 401);
      }

      if (!payload?.uid) {
        return createErrorResponse('Your session has expired. Please log in again', 401);
      }

      const user = await User.findById(payload.uid).select('passwordHash').exec();
      if (!user) {
        return createErrorResponse('Account not found. Please sign up again', 404);
      }

      user.name = name;
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();

      await UserProfile.findOneAndUpdate(
        { user: user._id },
        { $set: { user: user._id, phone: normalizedPhone } },
        { new: true, upsert: true }
      );

      return createNoCacheResponse({ ok: true });
    }

    if (signupToken && SIGNUP_JWT_SECRET) {
      let payload: { email?: string } | null = null;
      try {
        payload = jwt.verify(signupToken, SIGNUP_JWT_SECRET) as { email?: string } | null;
      } catch {
        return createErrorResponse('Your signup session has expired. Please start again', 401);
      }

      if (!payload?.email) {
        return createErrorResponse('Your signup session has expired. Please start again', 401);
      }

      const email = payload.email.toLowerCase();
      const exists = await User.exists({ email });
      if (exists) {
        return createErrorResponse('Email already registered', 400);
      }

      const user = await User.create({
        name,
        email,
        isVerified: true,
        passwordHash: await bcrypt.hash(password, 10),
      });

      await UserProfile.create({ user: user._id, phone: normalizedPhone });
      await PendingSignup.deleteOne({ email });

      const token = jwt.sign({ uid: user._id, role: 'user' }, USER_JWT_SECRET, {
        expiresIn: `${SESSION_HOURS}h`,
      });

      const response = createNoCacheResponse({
        ok: true,
        user: { id: user._id, name: user.name, email: user.email },
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: SESSION_HOURS * 60 * 60,
      });

      response.cookies.set('signupToken', '', { maxAge: 0, path: '/' });

      return response;
    }

    return createErrorResponse('Please complete signup to continue', 401);
  } catch (error) {
    console.error('[auth/complete-profile] Error:', error);
    return createErrorResponse('Unable to complete profile. Please try again', 500);
  }
}
