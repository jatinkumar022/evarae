import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedCategories = cache(async () => {
  await connect();
  return Category.find({ isActive: true })
    .select('name slug image description banner mobileBanner -__v')
    .sort({ sortOrder: 1, name: 1 })
    .lean();
});

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cacheKey = getCacheKey('categories', 'all');
    const cached = await getCache<{ categories: unknown[] }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.VERY_LONG,
      });
    }

    const categories = await getCachedCategories();
    const response = { categories };
    
    await setCache(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.MEDIUM,
      staleWhileRevalidate: CACHE_TTL.VERY_LONG,
    });
  } catch {
    return createErrorResponse('Unable to load categories. Please try again later', 500);
  }
}
