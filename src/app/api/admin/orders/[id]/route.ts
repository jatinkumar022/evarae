import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import User from '@/models/userModel';
import Notification from '@/models/notificationModel';
import mongoose from 'mongoose';
import { notifyOrderStatusUpdate } from '@/lib/notify';

// Type definitions
interface OrderItem {
  product?: mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string };
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface LeanOrder {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string; name?: string; email?: string };
  items?: OrderItem[];
  orderNumber?: string;
  trackingNumber?: string;
  courierName?: string;
  orderStatus?: string;
  shippingAddress?: {
    fullName?: string;
  };
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

// Helper function to convert ObjectId to string
const convertIdToString = (id: mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string } | undefined): string => {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (id instanceof mongoose.Types.ObjectId) return id.toString();
  if (typeof id === 'object' && id._id) {
    if (id._id instanceof mongoose.Types.ObjectId) return id._id.toString();
    if (typeof id._id === 'string') return id._id;
  }
  return String(id);
};

// GET: Get single order by ID
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name slug images')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Convert MongoDB objects to plain JSON
    const leanOrder = order as LeanOrder;
    const formattedOrder = {
      ...leanOrder,
      _id: leanOrder._id.toString(),
      user: convertIdToString(leanOrder.user),
      items: (leanOrder.items || []).map((item) => ({
        ...item,
        product: convertIdToString(item.product),
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Admin Order GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load order. Please try again later' },
      { status: 500 }
    );
  }
}

// PATCH: Update order
export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[admin-order] PATCH request received');
    await connect();
    const { id } = await ctx.params;
    const body = await request.json();

    const allowedUpdates = [
      'orderStatus',
      'paymentStatus',
      'trackingNumber',
      'courierName',
      'notes',
    ];

    const updates: Record<string, unknown> = {};
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });

    // Get old order to check if status changed
    const oldOrder = (await Order.findById(id)
      .populate('user', 'name email')
      .lean()) as LeanOrder | null;

    const order = (await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name slug images')
      .lean()) as LeanOrder | null;

    if (!order) {
      console.warn('[admin-order] order not found', id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order status changed and send email
    const oldStatus = oldOrder?.orderStatus;
    const newStatus = order?.orderStatus;
    const populatedUser = order?.user;
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

    const shouldHandleStatusChange =
      oldStatus !== newStatus &&
      typeof newStatus === 'string' &&
      ['shipped', 'delivered', 'confirmed', 'processing', 'cancelled'].includes(newStatus);

    if (shouldHandleStatusChange) {
      console.log('[admin-order] status change detected', {
        orderId: order?._id,
        oldStatus,
        newStatus,
      });
      const orderNumber = order?.orderNumber || String(order?._id);
      const trackingNumber = order?.trackingNumber as string | undefined;
      const courierName = order?.courierName as string | undefined;
      const statusLabels: Record<string, string> = {
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        returned: 'Returned',
      };
      const statusLabel = statusLabels[newStatus as keyof typeof statusLabels] || newStatus;

      if (user?.email && user?.name) {
        console.log('[admin-order] sending status email', {
          orderId: order?._id,
          email: user.email,
          name: user.name,
          newStatus,
        });
        await notifyOrderStatusUpdate(
          user.email,
          user.name,
          orderNumber,
          newStatus,
          trackingNumber,
          courierName
        ).catch(err => console.error('Failed to send order status update email:', err));
      } else {
        console.warn(
          '[notifyOrderStatusUpdate] Missing customer info',
          JSON.stringify({
            orderId: order?._id,
            hasEmail: Boolean(user?.email),
            hasName: Boolean(user?.name),
            userId: normalizedUserId,
          })
        );
      }

      await Notification.create({
        type: 'order_status_changed',
        title: 'Order Status Updated',
        message: `Order #${orderNumber} status changed to ${statusLabel}`,
        orderId: order?._id,
        orderNumber,
        userId: normalizedUserId,
        metadata: {
          oldStatus,
          newStatus,
          customerName: user?.name || order?.shippingAddress?.fullName || 'Customer',
        },
      }).catch(err => console.error('Failed to create status change notification:', err));
      console.log('[admin-order] status notification stored', {
        orderId: order?._id,
        orderNumber,
        newStatus,
      });
    }

    // Convert MongoDB objects to plain JSON
    const formattedOrder = {
      ...order,
      _id: order._id.toString(),
      user: convertIdToString(order.user),
      items: (order.items || []).map((item) => ({
        ...item,
        product: convertIdToString(item.product),
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Admin Order PATCH error:', error);
    return NextResponse.json(
      { error: 'Unable to update order. Please try again later' },
      { status: 500 }
    );
  }
}

// DELETE: Delete order
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Admin Order DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to delete order. Please try again later' },
      { status: 500 }
    );
  }
}

