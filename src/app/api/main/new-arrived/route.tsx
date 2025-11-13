import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

export async function GET() {
  try {
    await connect();

    // Fetch latest 30 active products sorted by createdAt descending
    const products = await Product.find({ status: 'active' })
      .select(
        'name slug images price discountPrice status tags material colors stockQuantity'
      )
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const res = NextResponse.json({ products });
    // Add cache header for new arrivals (2 minutes)
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Latest products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load latest products. Please try again later' },
      { status: 500 }
    );
  }
}
