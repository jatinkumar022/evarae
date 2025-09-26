import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

export async function GET() {
  try {
    await connect();

    // Fetch 10 random active products
    const products = await Product.aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: 10 } }, // random 10
      {
        $project: {
          name: 1,
          slug: 1,
          images: 1,
          thumbnail: 1,
          price: 1,
          discountPrice: 1,
          status: 1,
          tags: 1,
          material: 1,
          colors: 1,
          categories: 1,
        },
      },
    ]);

    // Populate categories (since aggregate doesn't auto-populate)
    const populatedProducts = await Product.populate(products, {
      path: 'categories',
      select: 'name slug',
    });

    return NextResponse.json({ products: populatedProducts });
  } catch (error) {
    console.error('Random products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random products' },
      { status: 500 }
    );
  }
}
