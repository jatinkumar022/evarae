import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';

export async function POST(request: Request) {
  try {
    await connect();
    const { orderId, reason } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        notes: reason || null,
      },
      { new: true }
    );
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number' },
        { status: 404 }
      );
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
