import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedCollections = cache(async () => {
  await connect();
  return Collection.find({ isActive: true })
    .select('name slug image description sortOrder products -__v')
    .sort({ sortOrder: 1, name: 1 })
    .lean();
});

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cacheKey = getCacheKey('collections', 'all');
    const cached = await getCache<{ collections: unknown[] }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.VERY_LONG,
      });
    }

    const collections = await getCachedCollections();
    const response = { collections };
    
    await setCache(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.MEDIUM,
      staleWhileRevalidate: CACHE_TTL.VERY_LONG,
    });
  } catch {
    return createErrorResponse('Unable to load collections. Please try again later', 500);
  }
}
