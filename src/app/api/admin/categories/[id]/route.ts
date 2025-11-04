import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';

// -------------------- GET (View Category) --------------------
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 500 }
    );
  }
}

// -------------------- PUT (Update Category) --------------------
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id } = await params;
    const body = await request.json();
    console.log('[ADMIN CATEGORIES PUT] id:', id, 'body:', {
      name: body.name,
      image: body.image,
      description: body.description,
      banner: body.banner,
      mobileBanner: body.mobileBanner,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<{
      name: string;
      slug: string;
      description: string;
      image: string;
      banner: string;
      mobileBanner: string;
      isActive: boolean;
      sortOrder: number;
    }> = {};

    // Validate duplicate name (case insensitive)
    if (body.name && body.name !== category.name) {
      const existingCategoryByName = await Category.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, 'i') },
        _id: { $ne: id },
      });

      if (existingCategoryByName) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }

      // Generate new slug
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingCategoryBySlug = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingCategoryBySlug) {
        return NextResponse.json(
          { error: 'A category with a similar slug already exists' },
          { status: 400 }
        );
      }

      updateData.name = body.name;
      updateData.slug = slug;
    }

    // Optional fields
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.banner !== undefined) updateData.banner = body.banner;
    if (body.mobileBanner !== undefined)
      updateData.mobileBanner = body.mobileBanner;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    // Use document.set + save to ensure full persistence
    category.set(updateData);
    const updatedCategory = await category.save();

    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json(
      { error: 'Unable to update category. Please check all fields and try again' },
      { status: 500 }
    );
  }
}

// -------------------- DELETE (Delete Category) --------------------
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json(
      { error: 'Unable to delete category. Please try again' },
      { status: 500 }
    );
  }
}
