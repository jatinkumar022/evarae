import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';
import mongoose from 'mongoose';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { slug } = await params;

    // Optimize: Use select with minimal fields for existence check
    const current = await Product.findOne({ status: 'active', slug })
      .select('_id')
      .lean<{ _id: mongoose.Types.ObjectId | string } | null>();

    const filter: Record<string, unknown> = { status: 'active' };
    if (current) {
      // MongoDB can handle both ObjectId and string comparisons automatically
      // Convert to ObjectId for consistent comparison
      const currentId = current._id instanceof mongoose.Types.ObjectId 
        ? current._id 
        : new mongoose.Types.ObjectId(String(current._id));
      filter["_id"] = { $ne: currentId };
    }

    // sample 12 random products
    const products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: 12 } },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          images: 1,
          price: 1,
          discountPrice: 1,
          status: 1,
          tags: 1,
          material: 1,
          colors: 1,
          stockQuantity: 1,
          sku: 1,
          categories: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const res = NextResponse.json({ products });
    // Add cache header for related products (2 minutes)
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res;
  } catch (error) {
    console.error('related route error', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
