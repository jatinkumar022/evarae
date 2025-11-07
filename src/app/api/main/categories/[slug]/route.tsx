import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';
import mongoose from 'mongoose';
import { getCache, setCache, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';
import { createCachedResponse, createErrorResponse } from '@/lib/api/response';
import { cache } from 'react';

type RouteContext = { params: Promise<{ slug: string }> };

const getCachedCategory = cache(async (query: Record<string, unknown>) => {
  await connect();
  return Category.findOne({ ...query, isActive: true })
    .select('name slug image description isActive banner mobileBanner -__v')
    .lean();
});

const getCachedProducts = cache(async (categoryId: string, page: number, limit: number) => {
  await connect();
  const skip = (page - 1) * limit;
  return Promise.all([
    Product.find({
      categories: categoryId,
      status: 'active',
    })
      .select('name slug images price discountPrice status stockQuantity material colors -description -metaTitle -metaDescription -__v')
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({
      categories: categoryId,
      status: 'active',
    }),
  ]);
});

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };
    
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24')));

    const cacheKey = getCacheKey('category', slug, includeProducts ? `products-${page}-${limit}` : 'meta');
    const cached = await getCache<{ category?: unknown; products?: unknown[]; pagination?: unknown }>(cacheKey);
    
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.LONG,
      });
    }

    const category = await getCachedCategory(query);

    if (!category) {
      return createErrorResponse('Category not found', 404);
    }

    if (!includeProducts) {
      const response = { category };
      await setCache(cacheKey, response, CACHE_TTL.MEDIUM);
      return createCachedResponse(response, {
        maxAge: CACHE_TTL.MEDIUM,
        staleWhileRevalidate: CACHE_TTL.LONG,
      });
    }

    const categoryId = (category._id as mongoose.Types.ObjectId).toString();
    const [products, total] = await getCachedProducts(categoryId, page, limit);
    
    const response = {
      category,
      products,
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
    return createErrorResponse('Unable to load category. Please try again later', 500);
  }
}
