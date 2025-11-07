import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
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

function sanitizePartialAddress(
  body: Partial<Address>
): Record<string, unknown> {
  const coerceStr = (v: unknown): string | undefined =>
    typeof v === 'string' ? v.trim() : undefined;
  const digits = (v: unknown): string | undefined =>
    typeof v === 'string' ? v.replace(/\D/g, '') : undefined;
  const boolOrUndef = (v: unknown): boolean | undefined =>
    typeof v === 'boolean' ? v : undefined;
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
    ...(boolOrUndef(body.isDefaultShipping) !== undefined && {
      isDefaultShipping: boolOrUndef(body.isDefaultShipping) as boolean,
    }),
    ...(boolOrUndef(body.isDefaultBilling) !== undefined && {
      isDefaultBilling: boolOrUndef(body.isDefaultBilling) as boolean,
    }),
  };
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    if (!USER_JWT_SECRET) return createErrorResponse('Please log in to continue', 401);
    await connect();
    const token = getCookie(request, 'token');
    if (!token) return createErrorResponse('Please log in to continue', 401);
    
    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[addresses PUT] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }
    
    if (!payload?.uid) return createErrorResponse('Please log in to continue', 401);

    const raw: Partial<Address> = await request.json();
    const $setFields = sanitizePartialAddress(raw);
    if (Object.keys($setFields).length === 0) {
      return createErrorResponse('No changes provided', 400);
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
    return createNoCacheResponse({ ok: true, addresses: profile?.addresses || [] });
  } catch (error) {
    console.error('[addresses PUT] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed') || error.message.includes('Invalid')) {
        return createErrorResponse('Address not found', 404);
      }
    }
    
    return createErrorResponse('Unable to update address. Please try again', 500);
  }
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    if (!USER_JWT_SECRET) return createErrorResponse('Please log in to continue', 401);
    await connect();
    const token = getCookie(request, 'token');
    if (!token) return createErrorResponse('Please log in to continue', 401);
    
    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[addresses PATCH] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }
    
    if (!payload?.uid) return createErrorResponse('Please log in to continue', 401);

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
    return createNoCacheResponse({ ok: true, addresses: profile?.addresses || [] });
  } catch (error) {
    console.error('[addresses PATCH] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed') || error.message.includes('Invalid')) {
        return createErrorResponse('Address not found', 404);
      }
    }
    
    return createErrorResponse('Unable to set default address. Please try again', 500);
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    if (!USER_JWT_SECRET) return createErrorResponse('Please log in to continue', 401);
    await connect();
    const token = getCookie(request, 'token');
    if (!token) return createErrorResponse('Please log in to continue', 401);
    
    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as {
        uid?: string;
      } | null;
    } catch (jwtError) {
      console.error('[addresses DELETE] JWT verification failed:', jwtError);
      return createErrorResponse('Your session has expired. Please log in again', 401);
    }
    
    if (!payload?.uid) return createErrorResponse('Please log in to continue', 401);

    await UserProfile.updateOne(
      { user: payload.uid },
      { $pull: { addresses: { _id: id } } }
    );
    const profile = await UserProfile.findOne({ user: payload.uid })
      .select({ addresses: 1 })
      .lean<UserProfileLean | null>();
    return createNoCacheResponse({ ok: true, addresses: profile?.addresses || [] });
  } catch (error) {
    console.error('[addresses DELETE] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Cast to ObjectId failed') || error.message.includes('Invalid')) {
        return createErrorResponse('Address not found', 404);
      }
    }
    
    return createErrorResponse('Unable to delete address. Please try again', 500);
  }
}
