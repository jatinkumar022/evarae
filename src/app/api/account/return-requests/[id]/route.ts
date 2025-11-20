import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import ReturnRequest from '@/models/returnRequestModel';
import mongoose from 'mongoose';
import cache, { cacheKeys } from '@/lib/cache';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!USER_JWT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const token = getCookie(request, 'token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!payload?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = cacheKeys.userReturnRequests(payload.uid);
    const cached = cache.get<{ returnRequests: Array<{ _id: mongoose.Types.ObjectId | string }> }>(
      cacheKey
    );

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid return request ID' }, { status: 400 });
    }

    if (cached) {
      const cachedMatch = cached.returnRequests.find(
        req => String((req._id as mongoose.Types.ObjectId | string) ?? '') === id
      );
      if (cachedMatch) {
        const cachedResponse = NextResponse.json({ returnRequest: cachedMatch });
        cachedResponse.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');
        return cachedResponse;
      }
    }

    const returnRequest = await ReturnRequest.findOne({
      _id: id,
      user: payload.uid,
    }).lean();

    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ returnRequest });
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('[return-requests/[id] GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

