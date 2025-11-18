import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';
import Notification from '@/models/notificationModel';
import mongoose from 'mongoose';
import { notifyOrderPlaced } from '@/lib/notify';

interface LeanOrder {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string; name?: string; email?: string };
  orderNumber?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  orderStatus?: string;
  createdAt?: Date;
  [key: string]: unknown;
}

const isPopulatedUser = (
  value: LeanOrder['user']
): value is { _id?: mongoose.Types.ObjectId | string; name?: string; email?: string } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof mongoose.Types.ObjectId) &&
    !Array.isArray(value)
  );
};

export async function POST(request: Request) {
  try {
    console.log('[payment-success] request received');
    await connect();
    const { orderId, providerOrderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = (await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentProviderOrderId: providerOrderId || null,
        paidAt: new Date(),
      },
      { new: true }
    )
      .populate('user', 'name email')
      .lean()) as LeanOrder | null;

    if (!order) {
      console.warn('[payment-success] order not found', orderId);
      return NextResponse.json(
        { error: 'Order not found. Please check your order number' },
        { status: 404 }
      );
    }

    console.log('[payment-success] order found', {
      orderId: order._id,
      user: order.user,
      total: order.totalAmount,
    });

    // Send emails asynchronously (don't wait for them)
    const populatedUser = order.user;
    const userId =
      isPopulatedUser(populatedUser) && populatedUser._id
        ? (populatedUser._id as mongoose.Types.ObjectId | string | undefined)
        : populatedUser;
    const normalizedUserId =
      typeof userId === 'string'
        ? userId
        : userId instanceof mongoose.Types.ObjectId
          ? userId
          : undefined;
    const user = isPopulatedUser(populatedUser)
      ? { name: populatedUser.name, email: populatedUser.email }
      : { name: undefined, email: undefined };
    const customerName = user.name || order.shippingAddress?.fullName || 'Customer';
    const customerEmail = user.email;

    // Optional: clear cart for this user
    await Cart.updateOne({ user: normalizedUserId || order.user }, { $set: { items: [] } });
    console.log('[payment-success] cart cleared', {
      userId: normalizedUserId || order.user,
      cartCleared: true,
    });

    if (customerEmail && customerName) {
      const orderDate = new Date(order.createdAt || new Date()).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Send order confirmation to customer (with CC to orders@caelvi.com)
      console.log('[payment-success] sending order confirmation email', {
        orderId: order._id,
        customerEmail,
        customerName,
      });
      await notifyOrderPlaced({
        orderNumber: order.orderNumber || String(order._id),
        customerName,
        customerEmail,
        orderDate,
        items: (order.items || []).map(item => ({
          name: item.name || 'Unknown Product',
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        subtotal: order.subtotalAmount || 0,
        tax: order.taxAmount || 0,
        shipping: order.shippingAmount || 0,
        discount: order.discountAmount || 0,
        total: order.totalAmount || 0,
        shippingAddress: {
          fullName: order.shippingAddress?.fullName || '',
          phone: order.shippingAddress?.phone || '',
          line1: order.shippingAddress?.line1 || '',
          line2: order.shippingAddress?.line2,
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          postalCode: order.shippingAddress?.postalCode || '',
          country: order.shippingAddress?.country || 'IN',
        },
        orderStatus: order.orderStatus || 'processing',
      }).catch(err => console.error('Failed to send order confirmation email:', err));
      console.log('[payment-success] order confirmation email dispatched (or attempted)');
    } else {
      console.warn(
        '[notifyOrderPlaced] Missing customer email or name',
        JSON.stringify({
          orderId: order._id,
          hasEmail: Boolean(customerEmail),
          hasName: Boolean(customerName),
          userId: normalizedUserId || order.user,
        })
      );
    }

    // Create notification for admin panel (always, even if email failed)
    await Notification.create({
      type: 'order_placed',
      title: 'New Order Placed',
      message: `Order #${order.orderNumber || String(order._id)} placed by ${customerName} for ₹${order.totalAmount?.toLocaleString() || 0}`,
      orderId: order._id,
      orderNumber: order.orderNumber || String(order._id),
      userId: normalizedUserId,
      metadata: {
        customerName,
        customerEmail: customerEmail || null,
        totalAmount: order.totalAmount,
      },
    }).catch(err => console.error('Failed to create notification:', err));
    console.log('[payment-success] admin notification created', {
      orderId: order._id,
      orderNumber: order.orderNumber || String(order._id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[checkout/payment-success] Error:', error);
    return NextResponse.json(
      { error: 'Unable to process payment confirmation. Please contact support' },
      { status: 500 }
    );
  }
}
