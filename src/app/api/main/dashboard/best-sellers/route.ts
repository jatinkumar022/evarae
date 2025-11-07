import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

const getCachedBestSellers = cache(async () => {
  await connect();
  const products = await Product.aggregate([
    { $match: { status: 'active' } },
    { $sample: { size: 10 } },
    {
      $project: {
        name: 1,
        slug: 1,
        images: 1,
        price: 1,
        discountPrice: 1,
        status: 1,
        tags: 1,
        material: 1,
        colors: 1,
        categories: 1,
      },
    },
  ]);

  return Product.populate(products, {
    path: 'categories',
    select: 'name slug',
  });
});

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cacheKey = getCacheKey('best-sellers');
    const cached = await getCache<{ products: unknown[] }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const products = await getCachedBestSellers();
    const response = { products };
    
    await setCache(cacheKey, response, CACHE_TTL.SHORT);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.SHORT,
      staleWhileRevalidate: CACHE_TTL.MEDIUM,
    });
  } catch {
    return createErrorResponse('Unable to load products. Please try again later', 500);
  }
}
