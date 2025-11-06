import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';

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
  [key: string]: unknown;
}

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
      .populate('items.product', 'name slug images thumbnail')
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

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name slug images thumbnail')
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

