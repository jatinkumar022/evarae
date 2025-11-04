import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

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

    // Build search filter
    const filter = {
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    const products = await Product.find(filter)
      .select(
        'name slug images thumbnail price discountPrice status tags material colors stockQuantity'
      )
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Search products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to search. Please try again later' },
      { status: 500 }
    );
  }
}
