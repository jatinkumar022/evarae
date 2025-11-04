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
    console.log('Account update request received');
    
    if (!USER_JWT_SECRET) {
      console.error('[account/update] USER_JWT_SECRET is not set');
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 });
    }
    
    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      console.error('[account/update] No token found in cookies');
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 });
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[account/update] JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Your session has expired. Please log in again' }, { status: 401 });
    }
    
    if (!payload?.uid) {
      console.error('[account/update] No uid in payload:', payload);
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 });
    }
    console.log('User ID from token:', payload.uid);

    const body = (await request.json()) as Record<string, unknown>;
    console.log('Request body:', body);

    // Basic user fields allowed to update
    const { name } = body as { name?: unknown };

    const user = await User.findById(payload.uid);
    if (!user) {
      console.error('[account/update] User not found with ID:', payload.uid);
      return NextResponse.json({ error: 'Account not found. Please log in again' }, { status: 404 });
    }
    console.log('User found:', user._id);

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
      await user.save();
      console.log('User name updated');
    }

    // Profile fields (supported only)
    const profileUpdates: Record<string, unknown> = {};

    const copyIfPresent = <T = unknown>(
      key: string,
      mapper?: (v: T) => unknown
    ) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key] as T;
        profileUpdates[key] = mapper ? mapper(v) : v;
        console.log(`Adding profile update for ${key}:`, profileUpdates[key]);
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


    // Check for duplicate phone number if phone is being updated
    if (profileUpdates.phone && typeof profileUpdates.phone === 'string') {
      const phoneValue = String(profileUpdates.phone).trim();
      if (phoneValue) {
        // Check if phone is already taken by another user
        const existingProfile = await UserProfile.findOne({
          phone: phoneValue,
          user: { $ne: user._id }, // Exclude current user
        });
        
        if (existingProfile) {
          console.error('[account/update] Phone number already exists for another user');
          return NextResponse.json(
            { error: 'This phone number is already registered with another account' },
            { status: 409 }
          );
        }
      }
    }

    // Upsert profile
    let profile;
    try {
      profile = await UserProfile.findOneAndUpdate(
        { user: user._id },
        { $set: { user: user._id, ...profileUpdates } },
        { new: true, upsert: true }
      );
    } catch (dbError: unknown) {
      // Handle duplicate key error specifically
      if (
        dbError instanceof Error &&
        dbError.message.includes('E11000') &&
        dbError.message.includes('phone')
      ) {
        console.error('[account/update] Duplicate phone number error:', dbError);
        return NextResponse.json(
          { error: 'This phone number is already registered with another account' },
          { status: 409 }
        );
      }
      throw dbError; // Re-throw if it's a different error
    }

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error('[account/update] Unexpected error:', error);
    console.error('[account/update] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('ValidationError') || error.message.includes('Cast')) {
        return NextResponse.json(
          { error: 'Please check all fields and try again' },
          { status: 400 }
        );
      }
      if (error.message.includes('not found') || error.message.includes('NotFound')) {
        return NextResponse.json(
          { error: 'Account not found. Please log in again' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Unable to save your changes. Please try again later' },
      { status: 500 }
    );
  }
}
