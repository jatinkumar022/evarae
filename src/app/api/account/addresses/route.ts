import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import UserProfile from '@/models/userProfile';
import type { Address, UserProfileLean } from '@/lib/types/product';

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

function sanitizeAddress(body: Partial<Address>): Address {
  const coerceStr = (v: unknown, fallback = ''): string =>
    typeof v === 'string' ? v.trim() : fallback;
  const digits = (v: unknown): string => coerceStr(v).replace(/\D/g, '');
  const country = coerceStr(body.country, 'IN') || 'IN';
  const boolOrFalse = (v: unknown): boolean =>
    typeof v === 'boolean' ? v : false;
  return {
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

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET)
      return NextResponse.json({ addresses: [] as Address[] });
    await connect();
    const token = getCookie(request, 'token');
    if (!token) return NextResponse.json({ addresses: [] as Address[] });
    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    if (!payload?.uid) return NextResponse.json({ addresses: [] as Address[] });

    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return NextResponse.json({ addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json({ addresses: [] as Address[] });
  }
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

    const raw = (await request.json()) as Partial<Address>;
    const addr = sanitizeAddress(raw);
    const invalid = validateAddress(addr);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: payload.uid },
      {
        $setOnInsert: { user: payload.uid },
        $push: { addresses: { ...addr } },
      },
      { new: true, upsert: true }
    ).lean<UserProfileLean>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save address' },
      { status: 500 }
    );
  }
}
