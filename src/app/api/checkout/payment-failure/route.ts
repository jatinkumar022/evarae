import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';

export async function POST(request: Request) {
  try {
    await connect();
    const { orderId, reason } = await request.json();
    if (!orderId)
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        notes: reason || null,
      },
      { new: true }
    );
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
