import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import cache, { cacheKeys } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || ''; // search query
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const cacheKey = cacheKeys.productList(
      `search:${query}:${page}:${limit}`
    );
    const cachedPayload = cache.get<unknown>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', 'no-store');
      return cachedResponse;
    }

    // Build search filter
    const filter = {
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    // Optimize: Run product query and count in parallel
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(
          'name slug images price discountPrice status tags stockQuantity'
        )
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const payload = {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
    cache.set(cacheKey, payload);

    const res = NextResponse.json(payload);
    // Add cache header for search results (30 seconds)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Search products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to search. Please try again later' },
      { status: 500 }
    );
  }
}
