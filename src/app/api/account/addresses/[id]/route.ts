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

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
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

    const body: Partial<Address> = await request.json();
    await UserProfile.updateOne(
      { user: payload.uid, 'addresses._id': id },
      {
        $set: Object.fromEntries(
          Object.entries(body).map(([k, v]) => [`addresses.$.${k}`, v])
        ),
      }
    );
    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
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

    // Unset default on all addresses
    await UserProfile.updateOne(
      { user: payload.uid },
      { $set: { 'addresses.$[].isDefaultShipping': false } }
    );
    // Set default on the chosen address
    await UserProfile.updateOne(
      { user: payload.uid, 'addresses._id': id },
      { $set: { 'addresses.$.isDefaultShipping': true } }
    );

    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
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

    await UserProfile.updateOne(
      { user: payload.uid },
      { $pull: { addresses: { _id: id } } }
    );
    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
