import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import ReturnRequest from '@/models/returnRequestModel';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';
import cache, { cacheKeys, clearKeys } from '@/lib/cache';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string;

function getCookie(req: Request, name: string): string | null {
  try {
    const token = (req.headers.get('cookie') || '')
      .split(';')
      .map(p => p.trim())
      .find(p => p.startsWith(name + '='))
      ?.split('=')[1];
    return token || null;
  } catch {
    return null;
  }
}

// Check if order is within 7 days return window
function isWithinReturnWindow(paidAt: string | Date | null): boolean {
  if (!paidAt) return false;
  const paidDate = new Date(paidAt);
  const now = new Date();
  const daysDiff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
  // Must be within 7 days and not in the future
  return daysDiff >= 0 && daysDiff <= 7;
}

export async function GET(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      return NextResponse.json({ returnRequests: [] }, { status: 200 });
    }

    await connect();
    const token = getCookie(request, 'token');
    if (!token) {
      return NextResponse.json({ returnRequests: [] }, { status: 200 });
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch {
      return NextResponse.json({ returnRequests: [] }, { status: 200 });
    }

    if (!payload?.uid) {
      return NextResponse.json({ returnRequests: [] }, { status: 200 });
    }

    const cacheKey = cacheKeys.userReturnRequests(payload.uid);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const sku = searchParams.get('sku');

    // If orderId and sku are provided, return single return request
    if (orderId && sku) {
      const returnRequest = await ReturnRequest.findOne({
        user: payload.uid,
        order: orderId,
        'orderItem.sku': sku,
      })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ returnRequest });
    }

    const cached = cache.get<{ returnRequests: unknown[] }>(cacheKey);
    if (cached) {
      const cachedResponse = NextResponse.json(cached);
      cachedResponse.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');
      return cachedResponse;
    }

    const returnRequests = await ReturnRequest.find({ user: payload.uid })
      .populate('order', 'orderNumber totalAmount paidAt')
      .sort({ createdAt: -1 })
      .lean();
    const responsePayload = { returnRequests };
    cache.set(cacheKey, responsePayload);
    const response = NextResponse.json(responsePayload);
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('[return-requests GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!USER_JWT_SECRET) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    await connect();

    const token = getCookie(request, 'token');
    if (!token) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    let payload: { uid?: string } | null = null;
    try {
      payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
    } catch {
      return NextResponse.json(
        { error: 'Your session has expired. Please log in again' },
        { status: 401 }
      );
    }

    if (!payload?.uid) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    if (!mongoose.isValidObjectId(payload.uid)) {
      return NextResponse.json(
        { error: 'Invalid account. Please log in again' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderId, orderItem, returnReason, note, images } = body;

    // Validate required fields
    if (!orderId || !orderItem || !returnReason || !images) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate orderItem structure
    if (typeof orderItem !== 'object' || !orderItem.name || !orderItem.sku || typeof orderItem.price !== 'number') {
      return NextResponse.json(
        { error: 'Invalid order item data' },
        { status: 400 }
      );
    }

    // Validate images (2-5 required)
    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      );
    }
    
    if (images.length < 2 || images.length > 5) {
      return NextResponse.json(
        { error: 'Please provide 2-5 images' },
        { status: 400 }
      );
    }

    // Validate each image URL is a string
    if (!images.every(img => typeof img === 'string' && img.trim().length > 0)) {
      return NextResponse.json(
        { error: 'All images must be valid URLs' },
        { status: 400 }
      );
    }

    // Validate return reason
    const validReasons = [
      'defective',
      'wrong_item',
      'quality_issue',
      'not_as_described',
      'damaged',
      'other',
    ];
    if (!validReasons.includes(returnReason)) {
      return NextResponse.json(
        { error: 'Invalid return reason' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    type LeanOrder = { paidAt?: Date | string | null };
    const order = await Order.findOne({
      _id: orderId,
      user: payload.uid,
    }).lean<LeanOrder>();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if order is within 7 days return window
    if (!isWithinReturnWindow(order?.paidAt ?? null)) {
      return NextResponse.json(
        { error: 'Return window has expired. Returns are only allowed within 7 days of purchase.' },
        { status: 400 }
      );
    }

    // Check if return request already exists for this order item
    const existingRequest = await ReturnRequest.findOne({
      order: orderId,
      'orderItem.sku': orderItem.sku,
      status: { $in: ['pending', 'approved', 'processing'] },
    })
      .select('_id')
      .lean();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A return request already exists for this item' },
        { status: 409 }
      );
    }

    // Create return request
    const returnRequest = new ReturnRequest({
      user: payload.uid,
      order: orderId,
      orderItem: {
        product: orderItem.product,
        name: orderItem.name,
        slug: orderItem.slug || '',
        sku: orderItem.sku || '',
        price: orderItem.price,
        quantity: orderItem.quantity,
        image: orderItem.image || null,
      },
      returnReason,
      note: (note || '').trim().substring(0, 1000),
      images,
      status: 'pending',
    });

    await returnRequest.save();
    clearKeys([cacheKeys.userReturnRequests(payload.uid)]);

    return NextResponse.json({
      success: true,
      returnRequest: {
        _id: returnRequest._id,
        status: returnRequest.status,
        createdAt: returnRequest.createdAt,
      },
    });
  } catch (error) {
    console.error('[return-requests POST] error:', error);
    const anyErr = error as { name?: string; message?: string };
    
    if (anyErr?.name === 'ValidationError') {
      return NextResponse.json(
        { error: anyErr.message || 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit return request. Please try again.' },
      { status: 500 }
    );
  }
}

