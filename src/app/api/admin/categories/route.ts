import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';

export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter = activeOnly ? { isActive: true } : {};

    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load categories. Please try again later' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connect();

    const body = await request.json();
    const { name, image, description, isActive, banner, mobileBanner } = body;

    console.log('[ADMIN CATEGORIES POST] body:', {
      name,
      image,
      description,
      isActive,
      banner,
      mobileBanner,
    });

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Category image is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug,
      image,
      description: description || '',
      isActive: isActive !== false,
      banner: banner || '',
      mobileBanner: mobileBanner || '',
    });

    await category.save();

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json(
      { error: 'Unable to create category. Please check all fields and try again' },
      { status: 500 }
    );
  }
}
