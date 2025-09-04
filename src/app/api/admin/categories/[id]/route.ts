import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Category from '@/models/categoryModel';

// -------------------- GET (View Category) --------------------
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await context.params; // ✅ Always await params
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
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// -------------------- PUT (Update Category) --------------------
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await context.params;
    const body = await request.json();
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

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
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// -------------------- DELETE (Delete Category) --------------------
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await context.params;
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
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
