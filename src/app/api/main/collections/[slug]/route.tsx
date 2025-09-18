import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();

    const { slug } = await params;
    const isObjectId = /^[a-f0-9]{24}$/i.test(slug);
    const query = isObjectId ? { _id: slug } : { slug };

    const collection = await Collection.findOne({ ...query, isActive: true })
      .select('name slug image description isActive products')
      .populate({
        path: 'products',
        select: 'name slug images thumbnail price discountPrice status',
        match: { status: 'active' },
        options: { limit: 24 },
      })
      .lean();

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Public collection GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}
