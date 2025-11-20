import { NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import Homepage from '@/models/homepageModel';
import Collection from '@/models/collectionModel';
import Category from '@/models/categoryModel';
import Product from '@/models/productModel';
import Order from '@/models/orderModel';
import mongoose from 'mongoose';
import cache, { cacheKeys } from '@/lib/cache';

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

const CACHE_CONTROL = 'public, s-maxage=120, stale-while-revalidate=600';

export async function GET() {
  try {
    const cachedPayload = cache.get<Record<string, unknown>>(cacheKeys.homepage);
    if (cachedPayload) {
      const cachedResponse = NextResponse.json(cachedPayload);
      cachedResponse.headers.set('Cache-Control', CACHE_CONTROL);
      return cachedResponse;
    }

    await connect();

    // Get homepage configuration
    const homepage = await Homepage.getHomepage();
    const daysBack = homepage.trendingConfig?.daysBack || 30;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const [
      categories,
      bestsellersAgg,
      signatureCollections,
      worldOfCaelviCollections,
      storyCollections,
      recentOrders,
    ] = await Promise.all([
      Category.find({ isActive: true })
        .select('name slug image description banner mobileBanner')
        .sort({ sortOrder: 1, name: 1 })
        .lean(),
      Product.aggregate([
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
            categories: 1,
          },
        },
      ]),
      Collection.find<LeanCollection>({
        _id: { $in: homepage.signatureCollections || [] },
        isActive: true,
      })
        .select('name slug image description')
        .lean(),
      Collection.find<LeanCollection>({
        _id: { $in: homepage.worldOfCaelviCollections || [] },
        isActive: true,
      })
        .select('name slug image description')
        .lean(),
      Collection.find<LeanCollection>({
        _id: { $in: homepage.storyCollections || [] },
        isActive: true,
      })
        .select('name slug image description')
        .lean(),
      Order.find({
        createdAt: { $gte: dateThreshold },
        orderStatus: { $ne: 'cancelled' },
      })
        .select('items')
        .lean<RecentOrder[]>(),
    ]);

    // Populate categories for bestsellers
    const populatedBestsellers = await Product.populate(bestsellersAgg, {
      path: 'categories',
      select: 'name slug',
    });

    // Calculate Currently Trending Collections based on recent sales
    const recentOrdersList = recentOrders ?? [];

    // Extract product IDs from recent orders
    const soldProductIds = new Set<string>();
    recentOrdersList.forEach(order => {
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

    const payload = {
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
      storyCollections: storyCollections || [],
    };

    cache.set(cacheKeys.homepage, payload);

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', CACHE_CONTROL);
    return res;
  } catch (error) {
    console.error('Homepage GET error:', error);
    return NextResponse.json(
      { error: 'Unable to load homepage data. Please try again later' },
      { status: 500 }
    );
  }
}

