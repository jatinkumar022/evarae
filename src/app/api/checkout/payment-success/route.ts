import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';

export async function POST(request: Request) {
  try {
    await connect();
    const { orderId, providerOrderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentProviderOrderId: providerOrderId || null,
      },
      { new: true }
    );
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number' },
        { status: 404 }
      );
    }

    // Optional: clear cart for this user
    await Cart.updateOne({ user: order.user }, { $set: { items: [] } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[checkout/payment-success] Error:', error);
    return NextResponse.json(
      { error: 'Unable to process payment confirmation. Please contact support' },
      { status: 500 }
    );
  }
}
