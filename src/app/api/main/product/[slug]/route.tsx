import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import cache, { cacheKeys } from '@/lib/cache';

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
  stockQuantity?: number;
  video?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;
  categories?: Array<{ name: string; slug: string }>;
};

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=900';

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const cacheKey = cacheKeys.productDetail(slug);
    const cachedPayload = cache.get<{ product: PublicProduct }>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', CACHE_CONTROL);
      return cachedResponse;
    }

    await connect();
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);

    // Optimize: Use single $or query instead of sequential queries
    const queryConditions: Record<string, unknown>[] = [
      { sku: slug },
      { slug },
    ];
    if (isObjectId) {
      queryConditions.push({ _id: slug });
    }

    const product = await Product.findOne({
      status: 'active',
      $or: queryConditions,
    })
      .select(
        'name slug description images price discountPrice status tags stockQuantity video metaTitle metaDescription sku'
      )
      .populate('categories', 'name slug')
      .lean<PublicProduct | null>();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const payload = { product };
    cache.set(cacheKey, payload);
    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', CACHE_CONTROL);
    return res;
  } catch (error) {
    console.error('Public product GET error:', error);
    return NextResponse.json(
      { error: 'Product not found or unavailable' },
      { status: 500 }
    );
  }
}
