import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserProfile from '@/models/userProfile';
import type { Address, UserProfileLean } from '@/lib/types/product';
import { createErrorResponse, createNoCacheResponse } from '@/lib/api/response';

function getCookie(req: Request, name: string): string | null {
  try {
    const token = (req.headers.get('cookie') || '')
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith(name + '='))
      ?.split('=')[1];
    return token || null;
  } catch {
    return null;
  }
}

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

export const runtime = 'nodejs';

function sanitizeAddress(body: Partial<Address>): Address {
  const coerceStr = (v: unknown, fallback = ''): string =>
    typeof v === 'string' ? v.trim() : fallback;
  const digits = (v: unknown): string => coerceStr(v).replace(/\D/g, '');
  const country = coerceStr(body.country, 'IN') || 'IN';
  const boolOrFalse = (v: unknown): boolean =>
    typeof v === 'boolean' ? v : false;
  return {
    label: coerceStr((body as { label?: string }).label, 'Home'),
    fullName: coerceStr(body.fullName),
    phone: digits(body.phone),
    line1: coerceStr(body.line1),
    line2: coerceStr(body.line2),
    city: coerceStr(body.city),
    state: coerceStr(body.state),
    postalCode: coerceStr(body.postalCode),
    country,
    isDefaultShipping: boolOrFalse(body.isDefaultShipping),
    isDefaultBilling: boolOrFalse(body.isDefaultBilling),
  };
}

function validateAddress(a: Address): string | null {
  if (!a.fullName) return 'Full name is required';
  if (!a.phone || a.phone.length < 6) return 'Valid phone is required';
  if (!a.line1) return 'Address line 1 is required';
  if (!a.city) return 'City is required';
  if (!a.state) return 'State is required';
  if (!a.postalCode) return 'Postal code is required';
  if (!a.country) return 'Country is required';
  return null;
}

async function parseAddressBody(request: Request): Promise<Partial<Address>> {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();

  // Prefer JSON when content-type suggests it
  if (contentType.includes('application/json')) {
    try {
      return (await request.json()) as Partial<Address>;
    } catch {
      throw NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  // Handle URL-encoded or multipart form bodies (common on some mobile webviews)
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const form = await request.formData();
      const get = (key: string) => {
        const v = form.get(key);
        return typeof v === 'string' ? v : '';
      };
      const coerceBool = (v: FormDataEntryValue | null) => {
        if (typeof v === 'string') {
          const s = v.toLowerCase();
          return s === 'true' || s === '1' || s === 'yes' || s === 'on';
        }
        return false;
      };
      return {
        fullName: get('fullName'),
        phone: get('phone'),
        line1: get('line1'),
        line2: get('line2'),
        city: get('city'),
        state: get('state'),
        postalCode: get('postalCode'),
        country: get('country') || 'IN',
        isDefaultShipping: coerceBool(form.get('isDefaultShipping')),
        isDefaultBilling: coerceBool(form.get('isDefaultBilling')),
        label: get('label') || 'Home',
      } as Partial<Address>;
    } catch {
      throw NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
  }

  // Fallback: attempt JSON, then form
  try {
    return (await request.json()) as Partial<Address>;
  } catch {}
  try {
    const form = await request.formData();
    const v = (k: string) => {
      const val = form.get(k);
      return typeof val === 'string' ? val : '';
    };
    return {
      fullName: v('fullName'),
      phone: v('phone'),
      line1: v('line1'),
      line2: v('line2'),
      city: v('city'),
      state: v('state'),
      postalCode: v('postalCode'),
      country: v('country') || 'IN',
      label: v('label') || 'Home',
    } as Partial<Address>;
  } catch {}

  throw NextResponse.json(
    { error: 'Unsupported or empty request body' },
    { status: 400 }
  );
}

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET) return createNoCacheResponse({ addresses: [] as Address[] });

    await connect();

    const token = getCookie(request, 'token');
    if (!token) return createNoCacheResponse({ addresses: [] as Address[] });

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch {
      return createNoCacheResponse({ addresses: [] as Address[] });
    }
    if (!payload?.uid) return createNoCacheResponse({ addresses: [] as Address[] });

    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return createNoCacheResponse({ addresses: profile?.addresses || [] });
  } catch {
    return createNoCacheResponse({ addresses: [] as Address[] });
  }
}

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) return createErrorResponse('Please log in to continue', 401);

    await connect();

    const token = getCookie(request, 'token');
    if (!token) return createErrorResponse('Please log in to continue', 401);

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch (jwtError) {
      console.error('[addresses POST] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }
    if (!payload?.uid) return createErrorResponse('Please log in to continue', 401);

    if (!mongoose.isValidObjectId(payload.uid)) {
      return createErrorResponse('Invalid account. Please log in again', 400);
    }

    const rawPartial = await parseAddressBody(request);
    const addr = sanitizeAddress(rawPartial);

    const invalid = validateAddress(addr);
    if (invalid) {
      return createErrorResponse(invalid, 400);
    }

    const now = new Date();
    const addressToPush = {
      ...addr,
      label: addr.label || 'Home',
      createdAt: now,
      updatedAt: now,
    } as Record<string, unknown>;

    const profile = await UserProfile.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(payload.uid) },
      {
        $setOnInsert: {
          user: new mongoose.Types.ObjectId(payload.uid),
          phone: null,
        },
        $push: { addresses: addressToPush },
      },
      { new: true, upsert: true }
    ).lean<UserProfileLean>();

    return createNoCacheResponse({ ok: true, addresses: profile?.addresses || [] });
  } catch (err: unknown) {
    // Log server-side for diagnosis
    try {
      console.error('[addresses POST] error:', err);
    } catch {}

    if (err instanceof Response) {
      return err;
    }

    // Map common Mongoose/Mongo errors to user-friendly messages
    const anyErr = err as { name?: string; message?: string; code?: number };
    if (anyErr?.name === 'ValidationError') {
      // Extract field name from validation error if possible
      const fieldMatch = anyErr.message?.match(/path `(\w+)`/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'field';
      return createErrorResponse(`Please check your ${fieldName} and try again`, 400);
    }
    if (anyErr?.name === 'MongoServerError' && anyErr?.code === 11000) {
      return createErrorResponse('This address already exists', 409);
    }

    return createErrorResponse('Unable to save address. Please check all fields and try again', 500);
  }
}
