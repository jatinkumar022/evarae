import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

type RouteContext = { params: Promise<{ slug: string }> };

type PublicProduct = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  price?: number;
  discountPrice?: number | null;
  status?: string;
  tags?: string[];
  material?: string;
  colors?: string[];
  stockQuantity?: number;
  video?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;
  categories?: Array<{ name: string; slug: string }>;
};

const getCachedProduct = cache(async (query: Record<string, unknown>) => {
  await connect();
  return Product.findOne({ ...query, status: 'active' })
    .select('name slug description images price discountPrice status tags material colors stockQuantity video metaTitle metaDescription sku -__v')
    .populate('categories', 'name slug -__v')
    .lean<PublicProduct | null>();
});

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    
    const cacheKey = getCacheKey('product', slug);
    const cached = await getCache<{ product: PublicProduct }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.LONG,
      });
    }

    await connect();
    
    const baseQuery: Record<string, unknown> = { status: 'active' };
    let product = await getCachedProduct({ ...baseQuery, sku: slug });

    if (!product) {
      const which = isObjectId ? { _id: slug } : { slug };
      product = await getCachedProduct(which);
    }

    if (!product) {
      return createErrorResponse('Product not found', 404);
    }

    const response = { product };
    await setCache(cacheKey, response, CACHE_TTL.MEDIUM);
    
    return createCachedResponse(response, {
      maxAge: CACHE_TTL.MEDIUM,
      staleWhileRevalidate: CACHE_TTL.LONG,
    });
  } catch {
    return createErrorResponse('Product not found or unavailable', 500);
  }
}
