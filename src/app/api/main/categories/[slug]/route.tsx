import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';
import mongoose from 'mongoose';
import cache, { cacheKeys } from '@/lib/cache';

type RouteContext = { params: Promise<{ slug: string }> };

const META_CACHE_CONTROL =
  'public, s-maxage=600, stale-while-revalidate=900';
const PRODUCTS_CACHE_CONTROL =
  'public, s-maxage=180, stale-while-revalidate=600';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const cacheKey = includeProducts
      ? cacheKeys.categoryWithProducts(slug)
      : cacheKeys.categoryMeta(slug);
    const cacheControl = includeProducts
      ? PRODUCTS_CACHE_CONTROL
      : META_CACHE_CONTROL;

    const cachedPayload = cache.get<Record<string, unknown>>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', cacheControl);
      return cachedResponse;
    }

    await connect();
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };

    const category = await Category.findOne({ ...query, isActive: true })
      .select('name slug image description isActive banner mobileBanner')
      .lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (!includeProducts) {
      const payload = { category };
      cache.set(cacheKey, payload);
      const res = NextResponse.json(payload);
      res.headers.set('Cache-Control', cacheControl);
      return res;
    }

    // ✅ Safely convert ObjectId to string
    const categoryId = (category._id as mongoose.Types.ObjectId).toString();

    const products = await Product.find({
      categories: categoryId,
      status: 'active',
    })
      .select('name slug images price discountPrice status stockQuantity')
      .limit(24)
      .lean();

    const payload = { category, products };
    cache.set(cacheKey, payload);
    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', cacheControl);
    return res;
  } catch (error) {
    console.error('Public category GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load category. Please try again later' },
      { status: 500 }
    );
  }
}
