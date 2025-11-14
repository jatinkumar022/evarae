import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import ReturnRequest from '@/models/returnRequestModel';
import mongoose from 'mongoose';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

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

async function verifyAdmin(request: Request): Promise<{ uid?: string } | null> {
  try {
    if (!ADMIN_JWT_SECRET) {
      return null;
    }
    const token = getCookie(request, 'adminToken');
    if (!token) {
      return null;
    }
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as { uid?: string } | null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid return request ID' }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.findById(id)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount paidAt')
      .lean();

    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ returnRequest });
  } catch (error) {
    console.error('[admin/return-requests/[id] GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

