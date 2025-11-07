import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 72);

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      return createErrorResponse('Config error', 500);
    }

    await connect();
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      otp?: unknown;
    };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

    if (!email || !otp) {
      return createErrorResponse('Email and OTP are required', 400);
    }

    const user = await User.findOne({ email })
      .select(
        'name email loginOtpHash loginOtpExpiry loginOtpAttempts passwordHash'
      )
      .exec();

    if (!user || !user.loginOtpHash || !user.loginOtpExpiry) {
      return createErrorResponse('Invalid OTP', 400);
    }

    if (new Date() > new Date(user.loginOtpExpiry)) {
      return createErrorResponse('OTP expired', 400);
    }

    if ((user.loginOtpAttempts || 0) >= 5) {
      return createErrorResponse('Too many attempts. Request a new OTP.', 429);
    }

    const valid = await bcrypt.compare(otp, user.loginOtpHash);
    user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;

    if (!valid) {
      await user.save();
      return createErrorResponse('Invalid OTP', 400);
    }

    user.loginOtpHash = null;
    user.loginOtpExpiry = null;
    user.loginOtpAttempts = 0;
    await user.save();

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

    return response;
  } catch (error) {
    console.error('[auth/login/verify-otp] Error:', error);
    return createErrorResponse('Unable to verify OTP. Please try again', 500);
  }
}
