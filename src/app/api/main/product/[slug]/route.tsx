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

    // Optimize: Use single $or query instead of sequential queries
    const queryConditions: Record<string, unknown>[] = [
      { sku: slug },
      { slug },
    ];
    if (isObjectId) {
      queryConditions.push({ _id: slug });
    }

    const product = await Product.findOne({
      status: 'active',
      $or: queryConditions,
    })
      .select(
        'name slug description images price discountPrice status tags material colors stockQuantity video metaTitle metaDescription sku'
      )
      .populate('categories', 'name slug')
      .lean<PublicProduct | null>();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const res = NextResponse.json({ product });
    // Add cache header for product details (5 minutes)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (error) {
    console.error('Public product GET error:', error);
    return NextResponse.json(
      { error: 'Product not found or unavailable' },
      { status: 500 }
    );
  }
}
