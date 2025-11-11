import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Homepage from '@/models/homepageModel';
import Collection from '@/models/collectionModel';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';

type LeanCollection = {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
};

type RecentOrder = {
  items: Array<{ product?: mongoose.Types.ObjectId | string }>;
};

export async function GET() {
  try {
    await connect();

    // Get homepage configuration
    const homepage = await Homepage.getHomepage();

    // Fetch categories (for Explore by Category section)
    const categories = await Category.find({ isActive: true })
      .select('name slug image description banner mobileBanner')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Fetch bestsellers (for Our Bestsellers section)
    const bestsellers = await Product.aggregate([
      { $match: { status: 'active' } },
      { $sample: { size: 10 } },
      {
        $project: {
          name: 1,
          slug: 1,
          images: 1,
          price: 1,
          discountPrice: 1,
          status: 1,
          tags: 1,
          material: 1,
          colors: 1,
          categories: 1,
        },
      },
    ]);

    // Populate categories for bestsellers
    const populatedBestsellers = await Product.populate(bestsellers, {
      path: 'categories',
      select: 'name slug',
    });

    // Fetch Signature Collections
    const signatureCollections = await Collection.find<LeanCollection>({
      _id: { $in: homepage.signatureCollections || [] },
      isActive: true,
    })
      .select('name slug image description')
      .lean();

    // Fetch World of Caelvi Collections
    const worldOfCaelviCollections = await Collection.find<LeanCollection>({
      _id: { $in: homepage.worldOfCaelviCollections || [] },
      isActive: true,
    })
      .select('name slug image description')
      .lean();

    // Calculate Currently Trending Collections based on recent sales
    const daysBack = homepage.trendingConfig?.daysBack || 30;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    // Get collections with products sold in the last N days
    const recentOrders = (await Order.find<RecentOrder>({
      createdAt: { $gte: dateThreshold },
      orderStatus: { $ne: 'cancelled' },
    })
      .select('items')
      .lean()) as unknown as RecentOrder[];

    // Extract product IDs from recent orders
    const soldProductIds = new Set<string>();
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          soldProductIds.add(item.product.toString());
        }
      });
    });

    // Find collections that contain these products
    const trendingCollectionIds = await Collection.distinct('_id', {
      products: { $in: Array.from(soldProductIds) },
      isActive: true,
    });

    // Fetch trending collections
    let trendingCollections = await Collection.find<LeanCollection>({
      _id: { $in: trendingCollectionIds },
      isActive: true,
    })
      .select('name slug image description')
      .limit(3)
      .lean();

    // If less than 3 trending collections, fill with random ones
    if (trendingCollections.length < 3) {
      const existingIds = trendingCollections.map(collection =>
        collection._id instanceof mongoose.Types.ObjectId
          ? collection._id.toString()
          : String(collection._id)
      );
      const randomCollections = await Collection.find<LeanCollection>({
        _id: { $nin: existingIds },
        isActive: true,
      })
        .select('name slug image description')
        .limit(3 - trendingCollections.length)
        .lean();
      trendingCollections = [...trendingCollections, ...randomCollections];
    }

    // Limit to 3 collections
    trendingCollections = trendingCollections.slice(0, 3);

    return NextResponse.json({
      hero: {
        images: homepage.heroImages || [],
      },
      categories: categories || [],
      bestsellers: populatedBestsellers || [],
      signatureCollections: signatureCollections || [],
      trendingCollections: trendingCollections || [],
      trendingConfig: homepage.trendingConfig || {
        enabled: true,
        daysBack: 30,
      },
      freshlyMinted: homepage.freshlyMinted || {
        backgroundImage: '',
        topImage1: '',
        topImage2: '',
        topImage1Title: '',
        topImage2Title: '',
        topImage1Link: '',
        topImage2Link: '',
      },
      worldOfCaelvi: worldOfCaelviCollections || [],
    });
  } catch (error) {
    console.error('Homepage GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load homepage data. Please try again later' },
      { status: 500 }
    );
  }
}

