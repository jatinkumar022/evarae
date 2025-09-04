// /app/api/products/route.ts
import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import Category from '@/models/categoryModel';

// GET: List products with filters, search, pagination
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.categories = category;
    if (status) filter.status = status;

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('categories', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: Request) {
  try {
    await connect();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'categories'];
    for (const field of requiredFields) {
      if (
        !body[field] ||
        (Array.isArray(body[field]) && body[field].length === 0)
      ) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate slug
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check duplicate slug
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 400 }
      );
    }

    // Validate categories
    if (body.categories?.length > 0) {
      const categories = await Category.find({ _id: { $in: body.categories } });
      if (categories.length !== body.categories.length) {
        return NextResponse.json(
          { error: 'One or more categories are invalid' },
          { status: 400 }
        );
      }
    }

    const product = new Product({
      ...body,
      slug,
      stockQuantity: body.stockQuantity || 0,
      status: body.status || 'active',
      tags: body.tags || [],
    });

    await product.save();
    await product.populate('categories', 'name slug');

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
