import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import mongoose from 'mongoose';
import Product from '@/models/productModel';
import Category from '@/models/categoryModel';

// GET product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    const { id } = await params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('categories', 'name slug')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product GET by ID error:', error);
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 500 }
    );
  }
}

// PUT update product by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    const { id } = await params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

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

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update slug if name changes
    if (body.name && body.name !== product.name) {
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const existingProduct = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      
      if (existingProduct) {
        return NextResponse.json(
          { error: 'A product with this name already exists' },
          { status: 400 }
        );
      }
      body.slug = slug;
    }

    // Validate categories if provided
    if (body.categories?.length > 0) {
      const categories = await Category.find({ _id: { $in: body.categories } });
      if (categories.length !== body.categories.length) {
        return NextResponse.json(
          { error: 'One or more categories are invalid' },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...body,
        stockQuantity: body.stockQuantity || 0,
        status: body.status || 'active',
        tags: body.tags || [],
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('categories', 'name slug');

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json(
      { error: 'Unable to update product. Please check all fields and try again' },
      { status: 500 }
    );
  }
}

// DELETE product by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    const { id } = await params;
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to delete product. Please try again' },
      { status: 500 }
    );
  }
}
