import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

type RouteContext = { params: Promise<{ slug: string }> };

type PublicProduct = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  thumbnail?: string | null;
  price?: number;
  discountPrice?: number | null;
  status?: string;
  tags?: string[];
  material?: string;
  colors?: string[];
  stockQuantity?: number;
  video?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;
  categories?: Array<{ name: string; slug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);

    // Try find by sku first, then by _id or slug
    const baseQuery: Record<string, unknown> = { status: 'active' };
    let product = await Product.findOne({ ...baseQuery, sku: slug })
      .select(
        'name slug description images thumbnail price discountPrice status tags material colors stockQuantity video metaTitle metaDescription sku'
      )
      .populate('categories', 'name slug')
      .lean<PublicProduct | null>();

    if (!product) {
      const which = isObjectId ? { _id: slug } : { slug };
      product = await Product.findOne({ ...which, status: 'active' })
        .select(
          'name slug description images thumbnail price discountPrice status tags material colors stockQuantity video metaTitle metaDescription sku'
        )
        .populate('categories', 'name slug')
        .lean<PublicProduct | null>();
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Public product GET error:', error);
    return NextResponse.json(
      { error: 'Product not found or unavailable' },
      { status: 500 }
    );
  }
}
