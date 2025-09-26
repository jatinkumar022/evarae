import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

export async function GET() {
  try {
    await connect();

    // Fetch latest 30 active products sorted by createdAt descending
    const products = await Product.find({ status: 'active' })
      .select(
        'name slug images thumbnail price discountPrice status tags material colors'
      )
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Latest products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest products' },
      { status: 500 }
    );
  }
}
