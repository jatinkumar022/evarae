import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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
    if (!USER_JWT_SECRET) {
      return createErrorResponse('Please log in to continue', 401);
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      return createErrorResponse('Please log in to continue', 401);
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch (jwtError) {
      console.error('[account/update] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }

    if (!payload?.uid) {
      return createErrorResponse('Please log in to continue', 401);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const user = await User.findById(payload.uid).select('name').exec();
    if (!user) {
      return createErrorResponse('Account not found. Please log in again', 404);
    }

    if (typeof body.name === 'string' && body.name.trim()) {
      user.name = body.name.trim();
      await user.save();
    }

    const profileUpdates: Record<string, unknown> = {};

    const copyIfPresent = (
      key: string,
      mapper?: (value: unknown) => unknown
    ) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        profileUpdates[key] = mapper ? mapper(body[key]) : body[key];
      }
    };

    copyIfPresent('phone', value =>
      typeof value === 'string'
        ? value.replace(/\D/g, '').slice(0, 15)
        : undefined
    );
    copyIfPresent('gender');
    copyIfPresent('dob', value => {
      if (typeof value !== 'string') return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    });
    copyIfPresent('newsletterOptIn', value => Boolean(value));
    copyIfPresent('smsNotifications', value => Boolean(value));
    copyIfPresent('emailNotifications', value => Boolean(value));
    copyIfPresent('orderUpdates', value => Boolean(value));
    copyIfPresent('promotionalEmails', value => Boolean(value));
    copyIfPresent('language');
    copyIfPresent('twoFactorEnabled', value => Boolean(value));

    if (
      typeof profileUpdates.phone === 'string' &&
      profileUpdates.phone.trim()
    ) {
      const phoneValue = profileUpdates.phone.trim();
      const existingProfile = await UserProfile.findOne({
        phone: phoneValue,
        user: { $ne: user._id },
      })
        .select('_id')
        .lean();

      if (existingProfile) {
        return createErrorResponse(
          'This phone number is already registered with another account',
          409
        );
      }
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: user._id },
      { $set: { user: user._id, ...profileUpdates } },
      { new: true, upsert: true }
    ).select('-__v');

    return createNoCacheResponse({ ok: true, profile });
  } catch (error) {
    console.error('[account/update] Unexpected error:', error);

    if (error instanceof Error) {
      if (error.message.includes('ValidationError') || error.message.includes('Cast')) {
        return createErrorResponse('Please check all fields and try again', 400);
      }
      if (error.message.includes('not found') || error.message.includes('NotFound')) {
        return createErrorResponse('Account not found. Please log in again', 404);
      }
    }

    return createErrorResponse('Unable to save your changes. Please try again later', 500);
  }
}
