import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Collection from '@/models/collectionModel';

export async function GET() {
  try {
    await connect();

    const collections = await Collection.find({ isActive: true })
      .select('name slug image description sortOrder products')
      // .populate({
      //   path: 'products',
      //   select: 'name slug images price discountPrice status',
      //   match: { status: 'active' },
      //   options: { limit: 12 },
      // })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Public collections GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
