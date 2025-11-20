import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';
import cache, { cacheKeys } from '@/lib/cache';

type RouteContext = { params: Promise<{ slug: string }> };

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const cacheKey = cacheKeys.collectionDetail(slug);
    const cachedPayload = cache.get<Record<string, unknown>>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', CACHE_CONTROL);
      return cachedResponse;
    }

    await connect();
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };

    const collection = await Collection.findOne({ ...query, isActive: true })
      .select('name slug image description isActive products')
      .populate({
        path: 'products',
        select:
          'name slug images price discountPrice status stockQuantity',
        match: { status: 'active' },
        options: { limit: 24 },
      })
      .lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const payload = { collection };
    cache.set(cacheKey, payload);

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', CACHE_CONTROL);
    return res;
  } catch (error) {
    console.error('Public collection GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load collection. Please try again later' },
      { status: 500 }
    );
  }
}
