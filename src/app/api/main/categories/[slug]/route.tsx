import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';
import mongoose from 'mongoose';

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
      const res = NextResponse.json({ category });
      // Add cache header for category details (5 minutes)
    res.headers.set('Cache-Control', 'no-store');
      return res;
    }

    // ✅ Safely convert ObjectId to string
    const categoryId = (category._id as mongoose.Types.ObjectId).toString();

    const products = await Product.find({
      categories: categoryId,
      status: 'active',
    })
      .select('name slug images price discountPrice status stockQuantity material colors')
      .limit(24)
      .lean();

    const res = NextResponse.json({ category, products });
    // Add cache header for category with products (2 minutes)
      res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Public category GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load category. Please try again later' },
      { status: 500 }
    );
  }
}
