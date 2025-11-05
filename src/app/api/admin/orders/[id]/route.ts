import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';

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
    const formattedOrder = {
      ...order,
      _id: (order as any)._id.toString(),
      user: (order as any).user ? (typeof (order as any).user === 'object' && (order as any).user._id ? (order as any).user._id.toString() : (typeof (order as any).user === 'string' ? (order as any).user : (order as any).user.toString())) : (order as any).user?.toString() || '',
      items: ((order as any).items || []).map((item: any) => ({
        ...item,
        product: item.product ? (typeof item.product === 'object' && item.product._id ? item.product._id.toString() : (typeof item.product === 'string' ? item.product : item.product.toString())) : item.product?.toString() || '',
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
    const formattedOrder = {
      ...order,
      _id: (order as any)._id.toString(),
      user: (order as any).user ? (typeof (order as any).user === 'object' && (order as any).user._id ? (order as any).user._id.toString() : (typeof (order as any).user === 'string' ? (order as any).user : (order as any).user.toString())) : (order as any).user?.toString() || '',
      items: ((order as any).items || []).map((item: any) => ({
        ...item,
        product: item.product ? (typeof item.product === 'object' && item.product._id ? item.product._id.toString() : (typeof item.product === 'string' ? item.product : item.product.toString())) : item.product?.toString() || '',
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

