import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';
import crypto from 'crypto';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;

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
    const uid = getUid(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Please log in to verify payment' },
        { status: 401 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      (await request.json()) as {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Optimize: Find and update order in one operation
    const order = await Order.findOneAndUpdate(
      {
        paymentProviderOrderId: razorpay_order_id,
        user: uid,
      },
      {
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
        paymentProviderPaymentId: razorpay_payment_id,
        paymentProviderSignature: razorpay_signature,
        paidAt: new Date(),
      },
      { new: true }
    ).select('_id orderNumber').lean<{ _id: unknown; orderNumber: string } | null>();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Optimize: Clear cart using updateOne (non-blocking, don't wait for result)
    Cart.updateOne({ user: uid }, { $set: { items: [] } }).catch(err => {
      console.error('[verify-payment] Failed to clear cart:', err);
    });

    return NextResponse.json({
      success: true,
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      message: 'Payment verified successfully',
    });
  } catch (e: unknown) {
    console.error('Payment verification error:', e);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
