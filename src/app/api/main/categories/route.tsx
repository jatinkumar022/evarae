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

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Public categories GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
