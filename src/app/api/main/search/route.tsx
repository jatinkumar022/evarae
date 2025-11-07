import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedSearch = cache(async (query: string, page: number, limit: number) => {
  await connect();
  const skip = (page - 1) * limit;
  const filter = {
    status: 'active',
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
    ],
  };

  return Promise.all([
    Product.find(filter)
      .select('name slug images price discountPrice status tags material colors stockQuantity -description -metaTitle -metaDescription -__v')
      .populate('categories', 'name slug -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));

    if (!query) {
      return createErrorResponse('Search query is required', 400);
    }

    const cacheKey = getCacheKey('search', query.toLowerCase().trim(), page.toString(), limit.toString());
    const cached = await getCache<{ products: unknown[]; pagination: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const [products, total] = await getCachedSearch(query, page, limit);
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
    return createErrorResponse('Unable to search. Please try again later', 500);
  }
}
