import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

type RouteContext = { params: Promise<{ slug: string }> };

const getCachedCollection = cache(async (query: Record<string, unknown>) => {
  await connect();
  return Collection.findOne({ ...query, isActive: true })
    .select('name slug image description isActive products -__v')
    .lean();
});

const getCachedCollectionProducts = cache(async (productIds: string[], page: number, limit: number) => {
  await connect();
  const skip = (page - 1) * limit;
  const ids = productIds.slice(skip, skip + limit);
  
  return Promise.all([
    Product.find({
      _id: { $in: ids },
      status: 'active',
    })
      .select('name slug images price discountPrice status stockQuantity material colors -description -metaTitle -metaDescription -__v')
      .lean(),
    Product.countDocuments({
      _id: { $in: productIds },
      status: 'active',
    }),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24')));

    const cacheKey = getCacheKey('collection', slug, `page-${page}-${limit}`);
    const cached = await getCache<{ collection: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.LONG,
      });
    }

    await connect();
    const collection = await getCachedCollection(query);

    if (!collection) {
      return createErrorResponse('Collection not found', 404);
    }

    const products = (collection as { products?: string[] }).products || [];
    const [collectionProducts, total] = await getCachedCollectionProducts(products, page, limit);
    
    const response = {
      collection: {
        ...collection,
        products: collectionProducts,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
    
    await setCache(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.MEDIUM,
      staleWhileRevalidate: CACHE_TTL.LONG,
    });
  } catch {
    return createErrorResponse('Unable to load collection. Please try again later', 500);
  }
}
