import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import UserProfile from '@/models/userProfile';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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
    if (!USER_JWT_SECRET)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connect();

    const token = getCookie(request, 'token');
    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    if (!payload?.uid)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as Record<string, unknown>;

    // Basic user fields allowed to update
    const { name } = body as { name?: unknown };

    const user = await User.findById(payload.uid);
    if (!user)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (typeof name === 'string' && name.trim()) user.name = name.trim();

    await user.save();

    // Profile fields (supported only)
    const profileUpdates: Record<string, unknown> = {};

    const copyIfPresent = <T = unknown>(
      key: string,
      mapper?: (v: T) => unknown
    ) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key] as T;
        profileUpdates[key] = mapper ? mapper(v) : v;
      }
    };

    copyIfPresent<string>('phone', v =>
      String(v || '')
        .replace(/\D/g, '')
        .slice(0, 15)
    );
    copyIfPresent('gender');
    copyIfPresent<string>('dob', v => {
      const parsed = new Date(v);
      return isNaN(parsed.getTime()) ? null : parsed;
    });

    copyIfPresent('newsletterOptIn', Boolean as (v: unknown) => boolean);
    copyIfPresent('smsNotifications', Boolean as (v: unknown) => boolean);
    copyIfPresent('emailNotifications', Boolean as (v: unknown) => boolean);
    copyIfPresent('orderUpdates', Boolean as (v: unknown) => boolean);
    copyIfPresent('promotionalEmails', Boolean as (v: unknown) => boolean);
    copyIfPresent('language');

    copyIfPresent('twoFactorEnabled', Boolean as (v: unknown) => boolean);

    // Upsert profile
    const profile = await UserProfile.findOneAndUpdate(
      { user: user._id },
      { $set: { user: user._id, ...profileUpdates } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
