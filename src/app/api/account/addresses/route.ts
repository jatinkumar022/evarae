import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/dbConfig';
import UserProfile from '@/models/userProfile';
import type { Address, UserProfileLean } from '@/lib/types/product';

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

    const body: Address = await request.json();
    const profile = await UserProfile.findOneAndUpdate(
      { user: payload.uid },
      {
        $setOnInsert: { user: payload.uid },
        $push: { addresses: { ...body } },
      },
      { new: true, upsert: true }
    ).lean<UserProfileLean>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
