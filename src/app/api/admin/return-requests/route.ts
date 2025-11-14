import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import ReturnRequest from '@/models/returnRequestModel';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

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

async function verifyAdmin(request: Request): Promise<{ uid?: string } | null> {
  if (!ADMIN_JWT_SECRET) return null;
  const token = getCookie(request, 'adminToken');
  if (!token) return null;
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as { uid?: string } | null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: { status?: string } = {};
    if (status && ['pending', 'approved', 'rejected', 'processing', 'completed'].includes(status)) {
      query.status = status;
    }

    const [returnRequests, total] = await Promise.all([
      ReturnRequest.find(query)
        .populate('user', 'name email')
        .populate('order', 'orderNumber totalAmount paidAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReturnRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      returnRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[admin/return-requests GET] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    const body = await request.json();
    const { returnRequestId, status, adminNotes } = body;

    if (!returnRequestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(returnRequestId)) {
      return NextResponse.json(
        { error: 'Invalid return request ID' },
        { status: 400 }
      );
    }

    const returnRequest = await ReturnRequest.findById(returnRequestId);
    if (!returnRequest) {
      return NextResponse.json(
        { error: 'Return request not found' },
        { status: 404 }
      );
    }

    // Update return request
    returnRequest.status = status;
    if (adminNotes !== undefined) {
      returnRequest.adminNotes = adminNotes || null;
    }
    if (status === 'approved' || status === 'rejected' || status === 'completed') {
      returnRequest.processedAt = new Date();
      returnRequest.processedBy = admin.uid;
    }

    await returnRequest.save();

    // If approved, optionally update order status
    if (status === 'approved') {
      await Order.findByIdAndUpdate(returnRequest.order, {
        $set: { orderStatus: 'returned' },
      });
    }

    return NextResponse.json({
      success: true,
      returnRequest: {
        _id: returnRequest._id,
        status: returnRequest.status,
        processedAt: returnRequest.processedAt,
      },
    });
  } catch (error) {
    console.error('[admin/return-requests PATCH] error:', error);
    return NextResponse.json(
      { error: 'Failed to update return request' },
      { status: 500 }
    );
  }
}

