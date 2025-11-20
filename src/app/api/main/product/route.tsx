import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import cache, { cacheKeys } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: 'active' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter['categories'] = category;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const cacheKey = cacheKeys.productList(
      `list:${page}:${limit}:${search}:${category}:${sortBy}:${sortOrder}`
    );
    const cachedPayload = cache.get<unknown>(cacheKey);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', 'no-store');
      return cachedResponse;
    }

    // Optimize: Run product query and count in parallel
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name slug images price discountPrice status tags stockQuantity')
        .populate('categories', 'name slug')
        .sort(sort)
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
    // Add cache header for product lists (1 minute)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Public products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load products. Please try again later' },
      { status: 500 }
    );
  }
}
