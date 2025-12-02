import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import Cart from '@/models/cartModel';
import Notification from '@/models/notificationModel';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { notifyOrderPlaced } from '@/lib/notify';
import { clearKeys, cacheKeys } from '@/lib/cache';
// Invoice generation removed - PDFs are now generated on-demand when download button is clicked

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
    
    // Security: Verify user authentication
    const uid = getUid(request);
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, providerOrderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Security: Verify user owns the order
    // Only update if order is still pending (idempotency check)
    const order = (await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: uid, // Critical: Ensure user owns the order
        paymentStatus: { $in: ['pending'] }, // Only update if still pending
      },
      {
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentProviderOrderId: providerOrderId || null,
        paidAt: new Date(),
      },
      { new: true }
    )
      .select('_id user orderNumber items subtotalAmount taxAmount shippingAmount discountAmount paymentChargesAmount totalAmount shippingAddress orderStatus createdAt paymentStatus')
      .populate('user', 'name email')
      .lean()) as LeanOrder & { paymentStatus?: string; paymentChargesAmount?: number } | null;

    if (!order) {
      // Check if order exists but was already processed
      const existingOrder = await Order.findOne({
        _id: orderId,
        user: uid,
      })
        .select('paymentStatus orderStatus')
        .lean<{ paymentStatus?: string; orderStatus?: string } | null>();
      
      if (existingOrder && (existingOrder.paymentStatus === 'completed' || existingOrder.paymentStatus === 'paid')) {
        // Order already processed, return success (idempotent)
        console.log('[payment-success] Order already processed', { orderId, uid, paymentStatus: existingOrder.paymentStatus });
        return NextResponse.json({ ok: true, alreadyProcessed: true });
      }
      
      console.warn('[payment-success] order not found or access denied', { orderId, uid });
      return NextResponse.json(
        { error: 'Order not found or access denied' },
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

    // Invalidate user-specific caches after payment success
    const userIdStr = typeof normalizedUserId === 'string' 
      ? normalizedUserId 
      : normalizedUserId instanceof mongoose.Types.ObjectId 
        ? normalizedUserId.toString() 
        : typeof order.user === 'string' 
          ? order.user 
          : order.user instanceof mongoose.Types.ObjectId 
            ? order.user.toString() 
            : undefined;
    
    if (userIdStr) {
      clearKeys([
        cacheKeys.checkout(userIdStr),
        cacheKeys.userCart(userIdStr),
      ]);
    }

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

    // Generate and upload invoice PDF to Cloudinary (only if not already generated)
    // Invoice generation removed - PDFs are now generated on-demand when download button is clicked
    // This saves Cloudinary storage costs and ensures fresh PDFs every time
    console.log('[payment-success] Invoice will be generated on-demand when user clicks download', {
      orderId: order._id,
      orderNumber: order.orderNumber,
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
