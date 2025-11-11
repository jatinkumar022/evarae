import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Product from '@/models/productModel';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connect();
    const { slug } = await params;

    const current = await Product.findOne({ status: 'active', slug })
      .select({ _id: 1, slug: 1 })
      .lean();

    const filter: Record<string, unknown> = { status: 'active' };
    if (current)
      filter['slug'] = { $ne: (current as unknown as { slug: string }).slug };

    // sample 8 random products
    const products = await Product.aggregate([
      { $match: filter },
      { $sample: { size: 8 } },
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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('people-also-bought route error', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
