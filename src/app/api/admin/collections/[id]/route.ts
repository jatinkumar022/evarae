import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';

// GET single collection
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connect();

    const collection = await Collection.findById(params.id)
      .populate('products')
      .lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Collection GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// UPDATE collection (details or products)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connect();
    const body = await request.json();

    const updateData: any = {};
    if (body.name) {
      updateData.name = body.name;
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (body.image !== undefined) updateData.image = body.image;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.products !== undefined) updateData.products = body.products;

    const updatedCollection = await Collection.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('products');

    if (!updatedCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Collection updated successfully',
      collection: updatedCollection,
    });
  } catch (error) {
    console.error('Collection PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connect();

    const deleted = await Collection.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Collection DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
