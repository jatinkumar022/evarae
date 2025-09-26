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

function sanitizePartialAddress(
  body: Partial<Address>
): Record<string, unknown> {
  const coerceStr = (v: unknown): string | undefined =>
    typeof v === 'string' ? v.trim() : undefined;
  const digits = (v: unknown): string | undefined =>
    typeof v === 'string' ? v.replace(/\D/g, '') : undefined;
  return {
    ...(coerceStr(body.fullName) !== undefined && {
      fullName: coerceStr(body.fullName),
    }),
    ...(digits(body.phone) !== undefined && { phone: digits(body.phone) }),
    ...(coerceStr(body.line1) !== undefined && {
      line1: coerceStr(body.line1),
    }),
    ...(coerceStr(body.line2) !== undefined && {
      line2: coerceStr(body.line2),
    }),
    ...(coerceStr(body.city) !== undefined && { city: coerceStr(body.city) }),
    ...(coerceStr(body.state) !== undefined && {
      state: coerceStr(body.state),
    }),
    ...(coerceStr(body.postalCode) !== undefined && {
      postalCode: coerceStr(body.postalCode),
    }),
    ...(coerceStr(body.country) !== undefined && {
      country: coerceStr(body.country),
    }),
    ...(typeof (body as any).isDefaultShipping === 'boolean' && {
      isDefaultShipping: Boolean((body as any).isDefaultShipping),
    }),
    ...(typeof (body as any).isDefaultBilling === 'boolean' && {
      isDefaultBilling: Boolean((body as any).isDefaultBilling),
    }),
  };
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

    const raw: Partial<Address> = await request.json();
    const $setFields = sanitizePartialAddress(raw);
    if (Object.keys($setFields).length === 0) {
      return NextResponse.json(
        { error: 'No changes provided' },
        { status: 400 }
      );
    }

    await UserProfile.updateOne(
      { user: payload.uid, 'addresses._id': id },
      {
        $set: Object.fromEntries(
          Object.entries($setFields).map(([k, v]) => [`addresses.$.${k}`, v])
        ),
      }
    );
    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return NextResponse.json({ ok: true, addresses: profile?.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update address' },
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
      { error: 'Failed to set default address' },
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
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
