import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedNewArrivals = cache(async (page: number, limit: number) => {
  await connect();
  const skip = (page - 1) * limit;
  return Promise.all([
    Product.find({ status: 'active' })
      .select('name slug images price discountPrice status tags material colors stockQuantity -description -metaTitle -metaDescription -__v')
      .populate('categories', 'name slug -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ status: 'active' }),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30')));

    const cacheKey = getCacheKey('new-arrivals', page.toString(), limit.toString());
    const cached = await getCache<{ products: unknown[]; pagination: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const [products, total] = await getCachedNewArrivals(page, limit);
    const totalPages = Math.ceil(total / limit);
    
    const response = {
      products,
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
    return createErrorResponse('Unable to load latest products. Please try again later', 500);
  }
}
