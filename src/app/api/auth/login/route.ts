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
      console.error('[auth/login] USER_JWT_SECRET is not configured');
      return createErrorResponse('Service temporarily unavailable. Please try again later', 500);
    }

    await connect();
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      password?: unknown;
    };

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return createErrorResponse('Please enter both email and password', 400);
    }

    const user = await User.findOne({ email })
      .select('name email passwordHash')
      .exec();

    if (!user || !user.passwordHash) {
      return createErrorResponse('Invalid email or password. Please check and try again', 401);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return createErrorResponse('Invalid email or password. Please check and try again', 401);
    }

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
    console.error('[auth/login] Error:', error);
    return createErrorResponse('Unable to sign in. Please try again later', 500);
  }
}
