import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';

// GET all collections
export async function GET(request: Request) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const filter = activeOnly ? { isActive: true } : {};

    let query = Collection.find(filter).sort({ sortOrder: 1, name: 1 }).lean();

    if (includeProducts) {
      query = query.populate('products');
    }

    const collections = await query;

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Collections GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load collections. Please try again later' },
      { status: 500 }
    );
  }
}

// CREATE new collection
export async function POST(request: Request) {
  try {
    await connect();
    const body = await request.json();
    const { name, image, description, isActive, sortOrder, products } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Collection image is required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingCollection = await Collection.findOne({ slug });
    if (existingCollection) {
      return NextResponse.json(
        { error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }

    const collection = new Collection({
      name,
      slug,
      image,
      description: description || '',
      isActive: isActive !== false,
      sortOrder: sortOrder || 0,
      products: products || [],
    });

    await collection.save();

    return NextResponse.json(
      { message: 'Collection created successfully', collection },
      { status: 201 }
    );
  } catch (error) {
    console.error('Collection POST error:', error);
    return NextResponse.json(
      { error: 'Unable to create collection. Please check all fields and try again' },
      { status: 500 }
    );
  }
}
