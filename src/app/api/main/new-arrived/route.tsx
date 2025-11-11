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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Latest products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load latest products. Please try again later' },
      { status: 500 }
    );
  }
}
