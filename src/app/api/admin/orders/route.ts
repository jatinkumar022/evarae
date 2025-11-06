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
    
    const [orders, total] = await Promise.all([
      Order.find(filter).select('-__v').populate('user', 'name email').sort(sort).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);
    
    const formattedOrders = (orders as LeanOrder[]).map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: convertIdToString(order.user),
      items: (order.items || []).map((item) => ({ ...item, product: convertIdToString(item.product) })),
    }));
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

