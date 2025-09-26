import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';

export async function POST(request: Request) {
  try {
    await connect();
    const { orderId, providerOrderId } = await request.json();
    if (!orderId)
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentProviderOrderId: providerOrderId || null,
      },
      { new: true }
    );
    if (!order)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Optional: clear cart for this user
    await Cart.updateOne({ user: order.user }, { $set: { items: [] } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
