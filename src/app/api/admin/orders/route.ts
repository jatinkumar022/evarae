import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Order from '@/models/orderModel';

// GET: List orders with filters, search, pagination
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const orderStatus = searchParams.get('orderStatus') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }
      filter.createdAt = dateFilter;
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Convert MongoDB objects to plain JSON
    const formattedOrders = orders.map((order: any) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user ? (typeof order.user === 'object' && order.user._id ? order.user._id.toString() : (typeof order.user === 'string' ? order.user : order.user.toString())) : order.user?.toString() || '',
      items: (order.items || []).map((item: any) => ({
        ...item,
        product: item.product ? (typeof item.product === 'object' && item.product._id ? item.product._id.toString() : (typeof item.product === 'string' ? item.product : item.product.toString())) : item.product?.toString() || '',
      })),
    }));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin Orders GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load orders. Please try again later' },
      { status: 500 }
    );
  }
}

