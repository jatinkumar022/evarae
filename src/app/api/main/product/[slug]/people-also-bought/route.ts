import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse } from '@/lib/api/response';
import { cache } from 'react';

type RouteContext = { params: Promise<{ slug: string }> };

const getCachedPeopleAlsoBought = cache(async (slug: string) => {
  await connect();
  const current = await Product.findOne({ status: 'active', slug })
    .select({ _id: 1, slug: 1 })
    .lean();

  const filter: Record<string, unknown> = { status: 'active' };
  if (current)
    filter['slug'] = { $ne: (current as unknown as { slug: string }).slug };

  return Product.aggregate([
    { $match: filter },
    { $sample: { size: 8 } },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        images: 1,
        price: 1,
        discountPrice: 1,
        status: 1,
        tags: 1,
        material: 1,
        colors: 1,
        stockQuantity: 1,
        sku: 1,
        categories: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const cacheKey = getCacheKey('product', slug, 'people-also-bought');
    const cached = await getCache<{ products: unknown[] }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.SHORT,
        staleWhileRevalidate: CACHE_TTL.MEDIUM,
      });
    }

    const products = await getCachedPeopleAlsoBought(slug);
    const response = { products };
    
    await setCache(cacheKey, response, CACHE_TTL.SHORT);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.SHORT,
      staleWhileRevalidate: CACHE_TTL.MEDIUM,
    });
  } catch {
    return createCachedResponse({ products: [] }, { maxAge: 60 });
  }
}
