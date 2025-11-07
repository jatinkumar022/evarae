import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedProducts = cache(async (
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  page: number,
  limit: number
) => {
  await connect();
  const skip = (page - 1) * limit;
  return Promise.all([
    Product.find(filter)
      .select('name slug images price discountPrice status tags material colors stockQuantity')
      .populate('categories', 'name slug')
      .sort(sort)
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filter: Record<string, unknown> = { status: 'active' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter['categories'] = category;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const cacheKey = getCacheKey('products', page.toString(), limit.toString(), search, category, sortBy, sortOrder);
    const cached = await getCache<{ products: unknown[]; pagination: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const [products, total] = await getCachedProducts(filter, sort, page, limit);
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
    return createErrorResponse('Unable to load products. Please try again later', 500);
  }
}
