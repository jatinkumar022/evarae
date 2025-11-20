import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import jwt from 'jsonwebtoken';
import { clearKeys, cacheKeys } from '@/lib/cache';

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
    const payload = jwt.verify(token, USER_JWT_SECRET) as {
      uid?: string;
    } | null;
    return payload?.uid || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    await connect();
    
    // Security: Verify user authentication
    const uid = getUid(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Security: Verify user owns the order
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: uid, // Critical: Ensure user owns the order
      },
      {
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        notes: reason || null,
      },
      { new: true }
    )
      .select('user')
      .lean<{ user?: unknown } | null>();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Invalidate checkout cache if user ID is available
    if (order.user) {
      const userIdStr = typeof order.user === 'string' 
        ? order.user 
        : String(order.user);
      clearKeys([cacheKeys.checkout(userIdStr)]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[checkout/payment-failure] Error:', error);
    return NextResponse.json(
      { error: 'Unable to process payment failure. Please contact support' },
      { status: 500 }
    );
  }
}
