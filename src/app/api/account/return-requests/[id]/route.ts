import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import ReturnRequest from '@/models/returnRequestModel';
import mongoose from 'mongoose';

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

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid return request ID' }, { status: 400 });
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

    return NextResponse.json({ returnRequest });
  } catch (error) {
    console.error('[return-requests/[id] GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

