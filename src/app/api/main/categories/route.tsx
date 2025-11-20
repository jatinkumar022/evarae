import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import cache, { cacheKeys } from '@/lib/cache';

export async function GET() {
  try {
    await connect();

    const cacheKey = cacheKeys.productList('categories');
    const cachedPayload = cache.get<unknown>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', 'no-store');
      return cachedResponse;
    }

    const categories = await Category.find({ isActive: true })
      .select('name slug image description banner mobileBanner')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const payload = { categories };
    cache.set(cacheKey, payload);

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Public categories GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load categories. Please try again later' },
      { status: 500 }
    );
  }
}
