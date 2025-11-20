import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';
import crypto from 'crypto';
import { clearKeys, cacheKeys } from '@/lib/cache';

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
    // Only update if order is still pending (idempotency check)
    const order = await Order.findOneAndUpdate(
      {
        paymentProviderOrderId: razorpay_order_id,
        user: uid,
        paymentStatus: { $in: ['pending'] }, // Only update if still pending
      },
      {
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
        paymentProviderPaymentId: razorpay_payment_id,
        paymentProviderSignature: razorpay_signature,
        paidAt: new Date(),
      },
      { new: true }
    ).select('_id orderNumber paymentStatus').lean<{ _id: unknown; orderNumber: string; paymentStatus?: string } | null>();

    if (!order) {
      // Check if order exists but was already processed
      const existingOrder = await Order.findOne({
        paymentProviderOrderId: razorpay_order_id,
        user: uid,
      })
        .select('paymentStatus orderStatus')
        .lean<{ paymentStatus?: string; orderStatus?: string } | null>();
      
      if (existingOrder && (existingOrder.paymentStatus === 'completed' || existingOrder.paymentStatus === 'paid')) {
        // Order already processed, return success (idempotent)
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          alreadyProcessed: true,
        });
      }
      
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Clear cart after successful payment verification
    // Use await to ensure cart is cleared before responding
    try {
      await Cart.updateOne({ user: uid }, { $set: { items: [] } });
    } catch (cartError) {
      // Log error but don't fail the payment verification
      console.error('[verify-payment] Failed to clear cart:', cartError);
      // Cart will be cleared on next cart operation or can be cleared manually
    }

    // Invalidate user-specific caches after payment verification
    clearKeys([
      cacheKeys.checkout(uid),
      cacheKeys.userCart(uid),
    ]);

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
