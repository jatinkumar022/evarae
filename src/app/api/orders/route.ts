import { connect } from '@/dbConfig/dbConfig';
import jwt from 'jsonwebtoken';
import Order from '@/models/orderModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

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

const getCachedOrders = cache(async (uid: string, page: number, limit: number) => {
  await connect();
  const skip = (page - 1) * limit;
  return Promise.all([
    Order.find({ user: uid })
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: uid }),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const uid = getUid(request);
    if (!uid) {
      return createErrorResponse('Please log in to view your orders', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const cacheKey = getCacheKey('orders', uid, page.toString(), limit.toString());
    const cached = await getCache<{ orders: unknown[]; pagination: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const [orders, total] = await getCachedOrders(uid, page, limit);
    const totalPages = Math.ceil(total / limit);
    
    const response = {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
    
    await setCache(cacheKey, response, CACHE_TTL.SHORT);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.SHORT,
      staleWhileRevalidate: CACHE_TTL.MEDIUM,
    });
  } catch {
    return createErrorResponse('Unable to load your orders. Please try again later', 500);
  }
}
