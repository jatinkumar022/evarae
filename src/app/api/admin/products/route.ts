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
    const limitParam = searchParams.get('limit');
    // Support fetching all products when limit is very high (for product selection modals)
    const limit = limitParam ? parseInt(limitParam) : 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = limit > 1000 ? 0 : (page - 1) * limit; // Skip pagination for large limits

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
    // For large limits (fetching all), set totalPages to 1
    const totalPages = limit > 1000 ? 1 : Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        page: limit > 1000 ? 1 : page,
        limit,
        total,
        totalPages,
        hasNext: limit > 1000 ? false : page < totalPages,
        hasPrev: limit > 1000 ? false : page > 1,
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load products. Please try again later' },
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
      { error: 'Unable to create product. Please check all fields and try again' },
      { status: 500 }
    );
  }
}
