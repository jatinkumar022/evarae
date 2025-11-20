import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';
import cache, { cacheKeys } from '@/lib/cache';

export async function GET() {
  try {
    await connect();

    const cacheKey = cacheKeys.productList('collections');
    const cachedPayload = cache.get<unknown>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', 'no-store');
      return cachedResponse;
    }

    const collections = await Collection.find({ isActive: true })
      .select('name slug image description sortOrder products')
      // .populate({
      //   path: 'products',
      //   select: 'name slug images price discountPrice status',
      //   match: { status: 'active' },
      //   options: { limit: 12 },
      // })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const payload = { collections };
    cache.set(cacheKey, payload);

    const res = NextResponse.json(payload);
    // Add cache header for collections (5 minutes)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Public collections GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load collections. Please try again later' },
      { status: 500 }
    );
  }
}
