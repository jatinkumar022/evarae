import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };

    const product = await Product.find({ ...query, status: 'active' })
      .select(
        'name slug description images thumbnail price discountPrice status tags material colors stockQuantity video metaTitle metaDescription'
      )
      .populate('categories', 'name slug')
      .lean()
      .then(results => results[0] || null);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Public product GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
