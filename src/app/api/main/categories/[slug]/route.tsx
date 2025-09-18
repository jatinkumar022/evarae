import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };

    const category = await Category.findOne({ ...query, isActive: true })
      .select('name slug image description isActive banner mobileBanner')
      .lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    if (!includeProducts) {
      return NextResponse.json({ category });
    }

    const categoryId = (category as { _id: string })._id;
    const products = await Product.find({
      categories: categoryId,
      status: 'active',
    })
      .select('name slug images thumbnail price discountPrice status')
      .limit(24)
      .lean();

    return NextResponse.json({ category, products });
  } catch (error) {
    console.error('Public category GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
