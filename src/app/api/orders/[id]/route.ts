import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

function getUid(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith('token='))
      ?.split('=')[1];
    if (!token || !USER_JWT_SECRET) return null;
    const payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    return payload?.uid || null;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const uid = getUid(request);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: key } = await ctx.params;
    const order = await Order.findOne(
      key.startsWith('ORD-')
        ? { orderNumber: key, user: uid }
        : { _id: key, user: uid }
    ).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e: unknown) {
    console.error('Order fetch error:', e);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
