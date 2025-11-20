import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import cache, { cacheKeys } from '@/lib/cache';

export async function GET() {
  try {
    await connect();

    const cacheKey = cacheKeys.bestSellers;
    const cachedPayload = cache.get<unknown>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', 'no-store');
      return cachedResponse;
    }

    // Fetch 10 random active products
    const products = await Product.aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: 10 } }, // random 10
      {
        $project: {
          name: 1,
          slug: 1,
          images: 1,
          price: 1,
          discountPrice: 1,
          status: 1,
          stockQuantity: 1,
          tags: 1,
          categories: 1,
        },
      },
    ]);

    // Populate categories (since aggregate doesn't auto-populate)
    const populatedProducts = await Product.populate(products, {
      path: 'categories',
      select: 'name slug',
    });

    const payload = { products: populatedProducts };
    cache.set(cacheKey, payload);

    const res = NextResponse.json(payload);
    // Add cache header for best sellers (2 minutes)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Random products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load products. Please try again later' },
      { status: 500 }
    );
  }
}
