import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';

export async function GET() {
  try {
    await connect();

    const categories = await Category.find({ isActive: true })
      .select('name slug image description banner mobileBanner')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const res = NextResponse.json({ categories });
    // Add cache header for categories (5 minutes)
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res;
  } catch (error) {
    console.error('Public categories GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load categories. Please try again later' },
      { status: 500 }
    );
  }
}
